import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

const languageMap: { [key: string]: string } = {
    'English (United States)': 'en-US',
    '日本語': 'ja',
    '简体中文 (中国)': 'zh-CN',
    '繁體中文 (臺灣)': 'zh-TW',
}

export const data = new SlashCommandBuilder()
    .setName('language')
    .setNameLocalizations({
        'en-US': 'language',
        'ja': '言語',
        'zh-CN': '语言',
        'zh-TW': '語言',
    })
    .setDescription('Set your preferred bot language. Note that some features prioritize server\'s language when used in one.')
    .setDescriptionLocalizations({
        'en-US': 'Set your preferred bot language. Note that some features prioritize server\'s language when used in one.',
        'ja': 'お好みのボット言語を設定してください。機能によっては、サーバーの言語を優先するものもあります。',
        'zh-CN': '设置您喜欢的机器人语言。请注意，某些功能会优先使用服务器语言。',
        'zh-TW': '設定您偏好的機器人語言。請注意，某些功能會優先使用伺服器的語言。',
    })
    .addStringOption(option => option
        .setName('language')
        .setNameLocalizations({
            'en-US': 'language',
            'ja': '言語',
            'zh-CN': '语言',
            'zh-TW': '語言',
        })
        .setDescription('Languages supported. Note that command names and descriptions are based on your Discord language.')
        .setDescriptionLocalizations({
            'en-US': 'Languages supported. Note that command names and descriptions are based on your Discord language.',
            'ja': '対応言語。コマンド名と説明はDiscordの言語に基づいています。',
            'zh-CN': '设置您喜欢的机器人语言。请注意，某些功能会优先使用服务器语言。',
            'zh-TW': '設定您偏好的機器人語言。請注意，某些功能會優先使用伺服器的語言。',
        })
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setContexts(0);
export async function execute(interaction: ChatInputCommandInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    i18next.changeLanguage(executeUser?.language);
    const unknownError = i18next.t('global:unknown_error');
    if (!interaction.guild) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    };

    const language = interaction.options.getString('language', true);
    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });

    i18next.changeLanguage(languageMap[language]);
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName
    });
    const serverLanguageChangedMessage = i18next.t('language:server_language_changed_message');
    const previousLanguageLiteral = i18next.t('language:previous_language_literal');
    const currentLanguageLiteral = i18next.t('language:current_language_literal');
    const executedByFooter = i18next.t('global:executed_by_footer');
    const previousLanguageName = i18next.t(`${guild.language}`, {
        ns: 'languages',
    });
    const currentLanguageName = i18next.t(`${language}`, {
        ns: 'languages',
    });

    const actionEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(serverLanguageChangedMessage)
        .setThumbnail(interaction.guild.iconURL())
        .addFields([
            {
                name: previousLanguageLiteral,
                value: previousLanguageName,
            },
            {
                name: currentLanguageLiteral,
                value: currentLanguageName,
            },
        ])
        .setFooter({
            text: executedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await guild.update({
        language: languageMap[language] ?? 'en-US',
    });

    await interaction.reply({
        embeds: [actionEmbed],
        components: [supportButton],
    });

    await sendLog(interaction.guild, {
        embeds: [actionEmbed],
        components: [supportButton],
    });
}
export async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
        'English (United States)',
        '日本語',
        '简体中文 (中国)',
        '繁體中文 (臺灣)',
    ];

    const filtered = choices.filter(choice => choice.startsWith(focusedValue.toLowerCase())
    );

    await interaction.respond(
        filtered.map(choice => ({
            name: choice,
            value: choice,
        }))
            .slice(0, 25)
    );
}