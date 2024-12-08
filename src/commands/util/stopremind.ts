import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import Reminder from '../../models/reminder.js';
import i18next from 'i18next';

// TODO: I18N command data
export const data = new SlashCommandBuilder()
    .setName('stopremind')
    .setDescription('Stop all your reminders.');
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

    const reminders = await Reminder.findAll({
        where: {
            userId: interaction.user.id,
        }
    });

    for (const reminder of reminders) {
        reminder.set({
            disabled: true,
        });
    }

    await interaction.reply({
        //TODO I18N this
        content: 'All your reminders have been stopped.',
        ephemeral: true,
    });
}