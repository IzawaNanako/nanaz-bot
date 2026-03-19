import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { setInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import { Reminder } from '../../models/reminder.js';
import { User } from '../../models/user.js';
import { uuidv7 } from 'uuidv7';
import schedule from 'node-schedule';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Manage your reminders.')
    .setDescriptionLocalizations({
        'en-US': 'Manage your reminders.',
        'ja': 'あなたのリマインドを管理する。',
        'zh-CN': '管理您的提醒。',
        'zh-TW': '管理您的提醒。',
    })
    .addSubcommand(subcommand => subcommand
        .setName('create')
        .setDescription('Create a new reminder.')
        .setDescriptionLocalizations({
            'en-US': 'Create a new reminder.',
            'ja': '新しいリマインドを作成する。',
            'zh-CN': '创建一个新的提醒。',
            'zh-TW': '創建一個新的提醒。',
        })
        .addStringOption(option => option
            .setName('content')
            .setDescription('The reminder you want to set. You should set "dm" to true if the reminder is private to you.')
            .setDescriptionLocalizations({
                'en-US': 'The reminder you want to set. You should set "dm" to true if the reminder is private to you.',
                'ja': 'リマインドを設定します。リマインドがあなたにしか見えない場合は"dm"をtrueにしてください。',
                'zh-CN': '设置提醒。如果提醒只对您可见,请将“dm”设置为true。',
                'zh-TW': '設定提醒。如果提醒只對您可見,請將“dm”設為true。',
            })
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('when')
            .setDescription('The time the bot should remind you or remind you until. /help reminder-format to see the formats.')
            .setDescriptionLocalizations({
                'en-US': 'The time the bot should remind you or remind you until. /help reminder-format to see the formats.',
                'ja': 'ボットがリマインドする時間、またはリマインドし続ける時間。フォーマットは/help reminder-formatで確認できます。',
                'zh-CN': '机器人应该提醒您的时间或提醒您直到。/help reminder-format查看格式。',
                'zh-TW': '機器人應該提醒您的時間或提醒您直到。/help reminder-format查看格式。',
            })
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName('once')
            .setDescription('Whether the reminder should be sent only once or repeatedly at the given time until you stop it.')
            .setDescriptionLocalizations({
                'en-US': 'Whether the reminder should be sent only once or repeatedly at the given time until you stop it.',
                'ja': 'リマインドを一度だけ送信するか、指定した時間に繰り返し送信するか。繰り返しの場合は停止するまで送信されます。',
                'zh-CN': '提醒是只发送一次还是在给定的时间重复发送直到您停止它。',
                'zh-TW': '提醒是只發送一次還是在給定的時間重複發送直到您停止它。',
            })
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName('dm')
            .setDescription('Whether the reminder should be sent in DMs (true) or in the channel you used the command in (false).')
            .setDescriptionLocalizations({
                'en-US': 'Whether the reminder should be sent in DMs (true) or in the channel you used the command in (false).',
                'ja': 'リマインドをDMで送信するか( true )、コマンドを使用したチャンネルで送信するか( false )。',
                'zh-CN': '提醒是发送到DM(true)还是您使用命令的频道(false)。',
                'zh-TW': '提醒是傳送到DM(true)還是您使用命令的頻道(false)。',
            })
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('list')
        .setDescription('List all your active reminders.')
        .setDescriptionLocalizations({
            'en-US': 'List all your active reminders.',
            'ja': 'あなたのすべてのアクティブなリマインドをリストします。',
            'zh-CN': '列出您所有的活动提醒。',
            'zh-TW': '列出您所有的活動提醒。',
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName('stop')
        .setDescription('Stop selected reminder.')
        .setDescriptionLocalizations({
            'en-US': 'Stop selected reminders.',
            'ja': '選択したリマインドを停止します。',
            'zh-CN': '停止选定的提醒。',
            'zh-TW': '停止選定的提醒。',
        })
        .addStringOption(option => option
            .setName('id')
            .setDescription('ID of the reminder to stop. Use /reminder list to see IDs, or type "all" to stop every reminder.')
            .setDescriptionLocalizations({
                'en-US': 'ID of the reminder to stop. Use /reminder list to see IDs, or type "all" to stop every reminder.',
                'ja': '停止したいリマインドのID。/reminder listコマンドからIDを取得できます。"all"と入力すると、すべてのリマインドを停止します。',
                'zh-CN': '您要停止的提醒的ID。您可以从/reminder list命令中获取ID。输入“all”以停止所有提醒。',
                'zh-TW': '您要停止的提醒的ID。您可以從/reminder list命令中獲取ID。輸入“all”以停止所有提醒。',
            })
            .setRequired(true)
        )
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    await setInteractionLanguage(interaction);

    const invalidOptionError = i18next.t('global.invalidOptionError');

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
        const unknownError = i18next.t('global.unknownError');
        const reminderLimitError = i18next.t('reminder.reminderLimitError');
        const invalidTimeError = i18next.t('reminder.invalidTimeError');
        const reminderTooLongError = i18next.t('reminder.reminderTooLongError');
        const reminderNoChannelError = i18next.t('reminder.reminderNoChannelError');
        const reminderInDMSuccessMessage = i18next.t('reminder.reminderInDMSuccessMessage');
        const reminderInGuildSuccessMessage = i18next.t('reminder.reminderInGuildSuccessMessage');

        const reminders = await Reminder.findAll({
            where: {
                userId: interaction.user.id,
            }
        });
        if (reminders.length >= 8) {
            await interaction.reply({
                content: reminderLimitError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const content = interaction.options.getString('content', true);
        let when = interaction.options.getString('when', true);
        const once = interaction.options.getBoolean('once', true);
        const dm = interaction.options.getBoolean('dm', true);

        const [user] = await User.findOrCreate({
            where: {
                id: interaction.user.id,
            }
        });

        let month: number | undefined;
        let day: number | undefined;
        let year: number | undefined;
        let hour: number | undefined;
        let minute: number | undefined
        let second: number = 0;
        let utcOffsetHours: number = 0;
        let utcOffsetMinutes: number = 0;

        const timezoneMatch = when.match(/\(UTC([+-]\d{2}):(\d{2})\)$/);
        if (timezoneMatch) {
            utcOffsetHours = parseInt(timezoneMatch[1]);
            utcOffsetMinutes = parseInt(timezoneMatch[2]);
            if (utcOffsetHours < 0) {
                utcOffsetMinutes = -utcOffsetMinutes;
            }
            when = when.replace(/\(UTC[+-]\d{2}:\d{2}\)$/, '').trim();
        }
        else {
            const tzMatch = user.timezone.match(/UTC([+-])(\d{1,2}):(\d{2})/);
            if (tzMatch) {
                utcOffsetHours = parseInt(tzMatch[2]) * (tzMatch[1] === '+' ? 1 : -1);
                utcOffsetMinutes = parseInt(tzMatch[3]) * (tzMatch[1] === '+' ? 1 : -1);
            }
        }
        const timezoneOffsetMinutes = utcOffsetHours * 60 + utcOffsetMinutes;
        const nowInSelectedTimezone = new Date(Date.now() + timezoneOffsetMinutes * 60 * 1000);
        const parts = when.trim().split(/\s+/);
        
        if (parts.length === 2) {
            const datePart = parts[0];
            const timePart = parts[1];

            const datePieces = datePart.split('/');
            month = parseInt(datePieces[0]);
            day = parseInt(datePieces[1]);
            year = datePieces[2] ? parseInt(datePieces[2]) : undefined;

            const timePieces = timePart.split(':');
            hour = parseInt(timePieces[0]);
            minute = parseInt(timePieces[1]);
            second = timePieces[2] ? parseInt(timePieces[2]) : 0;
        }
        else {
            const timePieces = parts[0].split(':');
            hour = parseInt(timePieces[0]);
            minute = parseInt(timePieces[1]);
            second = timePieces[2] ? parseInt(timePieces[2]) : 0;

            year = nowInSelectedTimezone.getUTCFullYear();
            month = nowInSelectedTimezone.getUTCMonth() + 1;
            day = nowInSelectedTimezone.getUTCDate();

            const nowSecondsInSelectedTimezone = nowInSelectedTimezone.getUTCHours() * 3600 + nowInSelectedTimezone.getUTCMinutes() * 60 + nowInSelectedTimezone.getUTCSeconds();
            const inputSecondsInSelectedTimezone = hour * 3600 + minute * 60 + second;

            if (inputSecondsInSelectedTimezone <= nowSecondsInSelectedTimezone) {
                const tomorrowInSelectedTimezone = new Date(Date.UTC(year, month - 1, day + 1));
                year = tomorrowInSelectedTimezone.getUTCFullYear();
                month = tomorrowInSelectedTimezone.getUTCMonth() + 1;
                day = tomorrowInSelectedTimezone.getUTCDate();
            }
        }

        if (hour === undefined || minute === undefined || month === undefined || day === undefined) {
            await interaction.reply({
                content: invalidTimeError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (year === undefined) {
            year = nowInSelectedTimezone.getUTCFullYear();
        }

        const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

        date.setUTCHours(date.getUTCHours() - utcOffsetHours);
        date.setUTCMinutes(date.getUTCMinutes() - utcOffsetMinutes);        

        if (isNaN(date.getTime()) || Date.now() >= date.getTime()) {
            await interaction.reply({
                content: invalidTimeError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (content.length > 100) {
            await interaction.reply({
                content: reminderTooLongError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!interaction.channel && !dm) {
            await interaction.reply({
                content: reminderNoChannelError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const remindData = await Reminder.create({
            id: uuidv7(),
            content: content,
            userId: interaction.user.id,
            when: date,
            once: once,
            dm: dm,
            channelId: dm ? null : interaction.channel?.id,
        });

        if (once) {
            if (dm) {
                schedule.scheduleJob(remindData.id, date, async () => {
                    await remindData.destroy();

                    await interaction.user.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
                });

                await interaction.reply({
                    content: reminderInDMSuccessMessage,
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                schedule.scheduleJob(remindData.id, date, async () => {
                    await remindData.destroy();

                    if (!interaction.channel || !interaction.channel.isSendable()) {
                        return;
                    }

                    await interaction.channel.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
                });

                await interaction.reply({
                    content: reminderInGuildSuccessMessage,
                });
            }
        }
        else {
            const seconds = date.getSeconds();
            const minutes = date.getMinutes();
            const hours = date.getHours();
            const cronTime = `${seconds} ${minutes} ${hours} * * *`;

            if (dm) {
                const job = schedule.scheduleJob(remindData.id, cronTime, async () => {
                    await interaction.user.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
        
                    if (Date.now() >= date.getTime()) {
                        await remindData.destroy();
                        job.cancel();
                    }
                });

                await interaction.reply({
                    content: reminderInDMSuccessMessage,
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                if (!interaction.channel || !interaction.channel.isSendable()) {
                    await interaction.reply({
                        content: unknownError,
                        flags: MessageFlags.Ephemeral,
                    });
                    await remindData.destroy();
                    return;
                }

                const job = schedule.scheduleJob(remindData.id, cronTime, async () => {
                    if (!interaction.channel || !interaction.channel.isSendable()) {
                        await remindData.destroy();
                        job.cancel();
                        return;
                    }

                    await interaction.channel.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
        
                    if (Date.now() >= date.getTime()) {
                        await remindData.destroy();
                        job.cancel();
                    }
                });

                await interaction.reply({
                    content: reminderInGuildSuccessMessage,
                });
            }
        }
    }
    else if (subcommand === 'list') {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        const noActiveRemindersError = i18next.t('reminder.noActiveRemindersError');
        const fetchedByFooter = i18next.t('global.fetchedByFooter');
        const reminderContentLiteral = i18next.t('reminder.reminderContentLiteral');
        const reminderTypeLiteral = i18next.t('reminder.reminderTypeLiteral');
        const reminderEmbedTitle = i18next.t('reminder.reminderEmbedTitle');
        const reminderEmbedDescription = i18next.t('reminder.reminderEmbedDescription');
        const reminderTypeOnce = i18next.t('reminder.reminderTypeOnce');
        const reminderTypeRepeating = i18next.t('reminder.reminderTypeRepeating');

        const reminders = await Reminder.findAll({
            where: {
                userId: interaction.user.id,
            }
        });

        if (reminders.length === 0) {
            await interaction.editReply({
                content: noActiveRemindersError,
            });
            return;
        }

        const remindersEmbed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle(reminderEmbedTitle)
            .setDescription(reminderEmbedDescription)
            .addFields(
                {
                    name: 'ID',
                    value: reminderContentLiteral,
                    inline: true,
                },
                {
                    name: 'Time',
                    value: reminderTypeLiteral,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                }
            )
            .setFooter({
                text: fetchedByFooter,
                iconURL: interaction.client.user.avatarURL() ?? undefined,
            })
            .setTimestamp();

        for (const reminder of reminders) {
            remindersEmbed
                .addFields(
                    {
                        name: `\`\`\`${reminder.id}\`\`\``,
                        value: `${reminder.content}`,
                        inline:true,
                    },
                    {
                        name:`<t:${Math.floor(reminder.when.getTime() / 1000)}:F>`,
                        value: reminder.once ? reminderTypeOnce : reminderTypeRepeating,
                        inline: true,
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                    }
                );
        }

        await interaction.editReply({
            embeds: [remindersEmbed],
        });
    }
    else if (subcommand === 'stop') {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        const noActiveRemindersError = i18next.t('reminder.noActiveRemindersError');
        const reminderNotExistError = i18next.t('reminder.reminderNotExistError');
        const stopRemindSuccessMessage = i18next.t('reminder.stopRemindSuccessMessage');

        const id = interaction.options.getString('id', true);
        if (id === 'all') {
            const reminders = await Reminder.findAll({
                where: {
                    userId: interaction.user.id,
                }
            });
            if (reminders.length === 0) {
                await interaction.editReply({
                    content: noActiveRemindersError,
                });
                return;
            }

            for (const reminder of reminders) {
                const scheduledJob = schedule.scheduledJobs[reminder.id];
                if (scheduledJob) {
                    scheduledJob.cancel();
                }
                await reminder.destroy();
            }
            
            await interaction.editReply({
                content: stopRemindSuccessMessage,
            });
        }
        else {
            const reminder = await Reminder.findOne({
                where: {
                    id,
                    userId: interaction.user.id,
                }
            });
            if (!reminder) {
                await interaction.editReply({
                    content: reminderNotExistError,
                });

                return;
            }

            const scheduledJob = schedule.scheduledJobs[reminder.id];
            if (scheduledJob) {
                scheduledJob.cancel();
            }
            await reminder.destroy();

            await interaction.editReply({
                content: stopRemindSuccessMessage,
            });
        }
    }
    else {
        await interaction.reply({
            content: invalidOptionError,
            flags: MessageFlags.Ephemeral,
        });
    }
}
