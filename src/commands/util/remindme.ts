import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import schedule from 'node-schedule';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import Reminder from '../../models/reminder.js';
import i18next from 'i18next';

// TODO: I18N command data
export const data = new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Sets a reminder for you to do something.')
    .addStringOption(option => option
        .setName('reminder')
        .setDescription('The reminder you want to set. You should set dm to true if the reminder is private to you.')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('when')
        .setDescription('The time the bot should remind you or remind you until. In unix timestamp: "/help unix-time".')
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName('once')
        .setDescription('Whether the reminder is a one-time reminder (true) or a everyday reminder (false). Defaults to true.')
    )
    .addBooleanOption(option => option
        .setName('dm')
        .setDescription('Whether the bot should DM you (true) or remind you in this channel (false). Defaults to true.')
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        await i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        if (executeUser) {
            await i18next.changeLanguage(executeUser.language);
        }
        else {
            await i18next.changeLanguage(interaction.locale);
        }
    }

    const reminder = interaction.options.getString('reminder', true);
    const once = interaction.options.getBoolean('once') ?? true;
    const when = interaction.options.getInteger('when', true);
    const dm = interaction.options.getBoolean('dm') ?? true;
    const date = new Date(when * 1000);
    if (isNaN(date.getTime()) || Date.now() >= date.getTime()) {
        await interaction.reply({
            // TODO: I18N this
            content: 'Invalid time.',
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
                // TODO: I18N this
                content: 'Reminder set! Make sure you allow the bot to send you DMs!',
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
                // TODO: I18N this
                content: 'Reminder set!',
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
                // TODO: I18N this
                content: 'Reminder set! Make sure you allow the bot to send you DMs!',
                ephemeral: true,
            });
        }
        else {
            if (!interaction.channel || !interaction.channel.isSendable()) {
                await interaction.reply({
                    // TODO: I18N this
                    content: 'Unknown error.',
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
                // TODO: I18N this
                content: 'Reminder set!',
            });
        }
    }
}