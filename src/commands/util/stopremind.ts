import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Reminder } from '../../models/reminder.js';
import { setPrivateInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('stopremind')
    .setDescription('Stop all your reminders.')
    .setDescriptionLocalizations({
        'en-US': 'Stop all your reminders.',
        'ja': 'あなたのすべてのリマインドを止める。',
        'zh-CN': '停止您的所有提醒。',
        'zh-TW': '停止您的所有提醒。',
    });
export async function execute(interaction: ChatInputCommandInteraction) {
    await setPrivateInteractionLanguage(interaction);

    const noActiveRemindersError = i18next.t('stopRemind.noActiveRemindersError');
    const stopRemindSuccessMessage = i18next.t('stopRemind.stopRemindSuccessMessage');

    const reminders = await Reminder.findAll({
        where: {
            userId: interaction.user.id,
        }
    });

    if (reminders.length === 0 || reminders.every(reminder => reminder.disabled)) {
        await interaction.reply({
            content: noActiveRemindersError,
            ephemeral: true,
        });
        return;
    }

    for (const reminder of reminders) {
        await reminder.update({
            disabled: true,
        });
    }

    await interaction.reply({
        content: stopRemindSuccessMessage,
        ephemeral: true,
    });
}