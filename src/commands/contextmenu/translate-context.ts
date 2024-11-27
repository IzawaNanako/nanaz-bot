import { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, ContextMenuCommandType, ApplicationCommandType } from 'discord.js'
import User from '../../models/user.js';
import translateWithDeepL from '../../utils/translateWithDeepL.js';
import i18next from 'i18next';

export const data = new ContextMenuCommandBuilder()
    .setName('Translate Message')
    .setNameLocalizations({
        'en-US': 'Translate Message',
        'ja': 'メッセージを翻訳する',
        'zh-CN': '翻译信息',
        'zh-TW': '翻譯訊息',
    })
    .setType(ApplicationCommandType.Message as ContextMenuCommandType);
export const execute = async (interaction: MessageContextMenuCommandInteraction) => {
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

    const invalidMessageError = i18next.t('translate.invalidMessageError');

    const message = interaction.targetMessage.content;
    if (message.trim() === '') {
        await interaction.reply({
            content: invalidMessageError,
            ephemeral: true,
        });
        return;
    }
    const language = executeUser ? executeUser.language : interaction.locale;
    const translatedText = await translateWithDeepL(message, language);

    const languageName = i18next.t(`${language}`, {
        ns: 'languages',
    });
    const translatedToMessage = i18next.t('translate.translatedToMessage', {
        translatedLanguage: languageName,
        translatedMessage: translatedText,
    });

    await interaction.reply({
        content: translatedToMessage,
        ephemeral: true,
    });
};