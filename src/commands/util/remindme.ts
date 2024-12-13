import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { setInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import { Reminder } from '../../models/reminder.js';
import schedule from 'node-schedule';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Sets a reminder for you to do something.')
    .setDescriptionLocalizations({
        'en-US': 'Sets a reminder for you to do something.',
        'ja': 'あなたに何かをするためのリマインドを設定する。',
        'zh-CN': '为您设置一个提醒。',
        'zh-TW': '為您設定一個提醒。',
    })
    .addStringOption(option => option
        .setName('content')
        .setNameLocalizations({
            'en-US': 'content',
            'ja': '内容',
            'zh-CN': '内容',
            'zh-TW': '內容',
        })
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
        .setNameLocalizations({
            'en-US': 'when',
            'ja': '何時',
            'zh-CN': '何时',
            'zh-TW': '何時',
        })
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
        .setNameLocalizations({
            'en-US': 'once',
            'ja': '一度',
            'zh-CN': '一次',
            'zh-TW': '一次',
        })
        .setDescription('Whether the reminder is a one-time reminder (true) or a everyday reminder (false). Defaults to true.')
        .setDescriptionLocalizations({
            'en-US': 'Whether the reminder is a one-time reminder (true) or a everyday reminder (false). Defaults to true.',
            'ja': 'リマインドは一度のリマインドか、毎日のリマインドかを決めます。 デフォルトはtrue。',
            'zh-CN': '提醒是否为一次性提醒(true)还是每日提醒(false)。 默认为true。',
            'zh-TW': '提醒是否為一次性提醒(true)還是每日提醒(false)。 預設為true。',
        })
    )
    .addBooleanOption(option => option
        .setName('dm')
        .setNameLocalizations({
            'en-US': 'dm',
            'ja': 'dm',
            'zh-CN': 'dm',
            'zh-TW': 'dm',
        })
        .setDescription('Whether the bot should DM you (true) or remind you in this channel (false). Defaults to true.')
        .setDescriptionLocalizations({
            'en-US': 'Whether the bot should DM you (true) or remind you in this channel (false). Defaults to true.',
            'ja': 'ボットがあなたにDMするか、このチャンネルにリマインドするかを決めます。 デフォルトはtrue。',
            'zh-CN': '是否让机器人DM您(true)还是在此频道提醒您(false)。 默认为true。',
            'zh-TW': '是否讓機器人DM您(true)還是在此頻道提醒您(false)。 預設為true。',
        })
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    await setInteractionLanguage(interaction);

    const unknownError = i18next.t('global.unknownError');
    const invalidTimeError = i18next.t('remindme.invalidTimeError');
    const reminderInDMSuccessMessage = i18next.t('remindme.reminderInDMSuccessMessage');
    const reminderInGuildSuccessMessage = i18next.t('remindme.reminderInGuildSuccessMessage');

    const reminder = interaction.options.getString('reminder', true);
    const once = interaction.options.getBoolean('once') ?? true;
    const when = interaction.options.getInteger('when', true);
    const dm = interaction.options.getBoolean('dm') ?? true;
    const date = new Date(when.toString().length === 10 ? when * 1000 : when);
    if (isNaN(date.getTime()) || Date.now() >= date.getTime()) {
        await interaction.reply({
            content: invalidTimeError,
            ephemeral: true,
        });
        return;
    }

    const remindData = await Reminder.create({
        content: reminder,
        userId: interaction.user.id,
        when: date,
        once: once,
        dm: dm,
        channelId: dm ? null : interaction.channel?.id,
        disabled: false,
    });

    if (once) {
        if (dm) {
            schedule.scheduleJob(date, async () => {
                if (remindData.disabled) {
                    await remindData.destroy();
                    return;
                }

                await remindData.destroy();

                await interaction.user.send({
                    content: `${interaction.user}\n${reminder}`,
                });
            });

            await interaction.reply({
                content: reminderInDMSuccessMessage,
                ephemeral: true,
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
                    content: `${interaction.user}\n${reminder}`,
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
            const job = schedule.scheduleJob(cronTime, async () => {
                if (remindData.disabled) {
                    await remindData.destroy();
                    job.cancel();
                    return;
                }

                await interaction.user.send({
                    content: `${interaction.user}\n${reminder}`,
                });
    
                if (Date.now() >= date.getTime()) {
                    await remindData.destroy();
                    job.cancel();
                }
            });

            await interaction.reply({
                content: reminderInDMSuccessMessage,
                ephemeral: true,
            });
        }
        else {
            if (!interaction.channel || !interaction.channel.isSendable()) {
                await interaction.reply({
                    content: unknownError,
                    ephemeral: true,
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
                    content: `${interaction.user}\n${reminder}`,
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