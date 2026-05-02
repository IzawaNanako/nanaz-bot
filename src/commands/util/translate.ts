import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { User } from '@models/user.js';
import { translateWithDeepL } from '@utils/translateWithDeepL.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate a message. For sending a translated message, use /send.')
    .setDescriptionLocalizations({
        'en-US': 'Translate a message. For sending a translated message, use /send.',
        'ja': 'メッセージを翻訳します。翻訳したメッセージを送信するには、/send を使用します。',
        'zh-CN': '翻译信息。要发送翻译后的信息，请使用 /send。',
        'zh-TW': '翻譯訊息。要傳送翻譯後的訊息，请使用 /send。',
    })
    .addStringOption(option => option
        .setName('message')
        .setDescription('The message to translate.')
        .setDescriptionLocalizations({
            'en-US': 'The message to translate.',
            'ja': '翻訳するメッセージ。',
            'zh-CN': '要翻译的信息。',
            'zh-TW': '要翻譯的訊息。',
        })
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('language')
        .setDescription('The language to translate to.')
        .setDescriptionLocalizations({
            'en-US': 'The language to translate to.',
            'ja': '翻訳する言語。',
            'zh-CN': '要翻译成的语言。',
            'zh-TW': '要翻譯成的語言。',
        })
    );
export const execute = async (interaction: ChatInputCommandInteraction) => {
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

    const message = interaction.options.getString('message', true);
    if (message.trim() === '') {
        await interaction.reply({
            content: invalidMessageError,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const language = interaction.options.getString('language') ?? executeUser?.language ?? interaction.locale;
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
        flags: MessageFlags.Ephemeral,
    });
};
