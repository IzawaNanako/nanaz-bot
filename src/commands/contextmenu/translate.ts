import { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, ContextMenuCommandType, ApplicationCommandType } from 'discord.js'
import translateWithDeepL from '../../utils/translateWithDeepL.js';

export const data = new ContextMenuCommandBuilder()
    .setName('Translate Message')
    .setType(ApplicationCommandType.Message as ContextMenuCommandType);
export const execute = async (interaction: MessageContextMenuCommandInteraction) => {
    const message = interaction.targetMessage.content;
    if (message.trim() === '') {
        await interaction.reply({
            content: 'Invalid message.',
            ephemeral: true,
        });
        return;
    }
    const language = interaction.locale;
    const languageNames = new Intl.DisplayNames([language], { type: 'language' });
    const translated = await translateWithDeepL(message, language);

    await interaction.reply({
        content: `_Translated to ${languageNames.of(language)}._\n\n${translated}`,
        ephemeral: true,
    });
};