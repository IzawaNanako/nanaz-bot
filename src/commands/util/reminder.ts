import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { setInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import { Reminder } from '../../models/reminder.js';
import { User } from '../../models/user.js';
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
        .addIntegerOption(option => option
            .setName('when')
            .setDescription('The time the bot should remind you or remind you until. In unix timestamp: "/help unix-time".')
            .setDescriptionLocalizations({
                'en-US': 'The time the bot should remind you or remind you until. In unix timestamp: "/help unix-time".',
                'ja': 'ボットがあなたにリマインドするか、あなたにリマインドするまでの時間を決めます。 Unixタイムスタンプ："/help unix-time"。',
                'zh-CN': '机器人应该提醒您或提醒您直到什么时候。Unix时间戳："/help unix-time"。',
                'zh-TW': '機器人應該提醒您或提醒您直到什麼時候。Unix時間戳："/help unix-time"。',
            })
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName('once')
            .setDescription('Whether the reminder should be sent only once or repeatedly until you stop it.')
            .setDescriptionLocalizations({
                'en-US': 'Whether the reminder should be sent only once or repeatedly until you stop it.',
                'ja': 'リマインドを一度だけ送信するか、停止するまで繰り返し送信するか。',
                'zh-CN': '提醒是只发送一次还是重复发送直到您停止它。',
                'zh-TW': '提醒是只傳送一次還是重複傳送直到您停止它。',
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
        const reminderOnCooldownError = i18next.t('reminder.reminderOnCooldownError');
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
        const when = interaction.options.getInteger('when', true);
        const once = interaction.options.getBoolean('once', true);
        const dm = interaction.options.getBoolean('dm', true);
        const date = new Date(when.toString().length === 10 ? when * 1000 : when);

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

        await User.findOrCreate({
            where: {
                id: interaction.user.id,
            },
        });

        const id = Math.floor(Date.now() / 1000);
        const remindCooldownCheck = await Reminder.findOne({
            where: {
                id: id,
            }
        });
        if (remindCooldownCheck) {
            await interaction.reply({
                content: reminderOnCooldownError,
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
            id: id,
            content: content,
            userId: interaction.user.id,
            when: date,
            once: once,
            dm: dm,
            channelId: dm ? null : interaction.channel?.id,
            disabled: false,
        });

        if (dm) {
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral,
            });
        }
        else {
            await interaction.deferReply();
        }

        if (once) {
            if (dm) {
                schedule.scheduleJob(date, async () => {
                    if (remindData.disabled) {
                        await remindData.destroy();
                        return;
                    }

                    await remindData.destroy();

                    await interaction.user.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
                });

                await interaction.editReply({
                    content: reminderInDMSuccessMessage,
                });
            }
            else {
                schedule.scheduleJob(date, async () => {
                    if (remindData.disabled) {
                        await remindData.destroy();
                        return;
                    }

                    await remindData.destroy();

                    if (!interaction.channel || !interaction.channel.isSendable()) {
                        return;
                    }

                    await interaction.channel.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
                });

                await interaction.editReply({
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
                const job = schedule.scheduleJob(cronTime, async () => {
                    if (remindData.disabled) {
                        await remindData.destroy();
                        job.cancel();
                        return;
                    }

                    await interaction.user.send({
                        content: `<@${interaction.user.id}>\n${content}`,
                    });
        
                    if (Date.now() >= date.getTime()) {
                        await remindData.destroy();
                        job.cancel();
                    }
                });

                await interaction.editReply({
                    content: reminderInDMSuccessMessage,
                });
            }
            else {
                if (!interaction.channel || !interaction.channel.isSendable()) {
                    await interaction.editReply({
                        content: unknownError,
                    });
                    await remindData.destroy();
                    return;
                }

                const job = schedule.scheduleJob(cronTime, async () => {
                    if (!interaction.channel || !interaction.channel.isSendable() || remindData.disabled) {
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

                await interaction.editReply({
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
        const reminderEmbedTitle = i18next.t('reminder.reminderEmbedTitle');
        const reminderEmbedDescription = i18next.t('reminder.reminderEmbedDescription');

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
            }

            for (const reminder of reminders) {
                reminder.disabled = true;
            }
            await interaction.editReply({
                content: stopRemindSuccessMessage,
            });
        }
        else {
            const reminder = await Reminder.findOne({
                where: {
                    id: parseInt(id),
                    userId: interaction.user.id,
                }
            });
            if (!reminder) {
                await interaction.editReply({
                    content: reminderNotExistError,
                });
                return;
            }

            reminder.disabled = true;

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
