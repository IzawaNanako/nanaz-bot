import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help on certain features of this bot.')
    .setDescriptionLocalizations({
        'en-US': 'Get help on certain features of this bot.',
        'ja': 'このボットの特定の機能に関するヘルプを取得します。',
        'zh-CN': '获取有关该机器人某些功能的帮助。',
        'zh-TW': '取得本機器人某些功能的協助。',
    })
    .addStringOption(option => option
        .setName('option')
        .setDescription('The thing you want to get help on, check "/help Menu" if you don\'t seem to find what you need.')
        .setDescriptionLocalizations({
            'en-US': 'The thing you want to get help on, check "/help Menu" if you don\'t seem to find what you need.',
            'ja': '必要なものが見つからなければ、"/help Menu"をチェックしてください。',
            'zh-CN': '您想得到帮助的事情，如果找不到所需的帮助，请查看"/help Menu"。',
            'zh-TW': '您想要獲得幫助的事情，如果找不到所需的幫助，請查看"/help Menu"。',
        })
        .setAutocomplete(true)
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        i18next.changeLanguage(executeUser?.language);
    }
    const invalidOptionError = i18next.t('global.invalidOptionError');
    const helpMenuTitle = i18next.t('help.helpMenuTitle');
    const helpMenuDescription = i18next.t('help.helpMenuDescription');
    const helpMenuOptionMenuDescription = i18next.t('help.helpMenuOptionMenuDescription');
    const helpMenuOptionSettingsDescription = i18next.t('help.helpMenuOptionSettingsDescription');
    const helpMenuOptionFormatsDescription = i18next.t('help.helpMenuOptionFormatsDescription');
    const helpMenuOptionIdsDescription = i18next.t('help.helpMenuOptionIdsDescription');
    const helpMenuOptionWelcomeMsgDescription = i18next.t('help.helpMenuOptionWelcomeMsgDescription');
    const settingsHelpsTitle = i18next.t('help.settingsHelpsTitle');
    const formattingHelpsTitle = i18next.t('help.formattingHelpsTitle');
    const idsHelpsTitle = i18next.t('help.idsHelpsTitle');
    const welcomeMsgHelpsTitle = i18next.t('help.welcomeMsgHelpsTitle');
    const helpEmbedFooter = i18next.t('help.helpEmbedFooter');
    const settingsHelpsContent = i18next.t('help.settingsHelpsContent');
    const formattingHelpsContent = i18next.t('help.formattingHelpsContent');
    const idsHelpsContent = i18next.t('help.idsHelpsContent');
    const welcomeMsgHelpsContent = i18next.t('help.welcomeMsgHelpsContent');
    
    let option = interaction.options.get('option')?.value as string;

    if (option) {
        option = option.toLowerCase();
    }

    const helpEmbed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({
            text: helpEmbedFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        });

    if (!option || option === 'menu') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle(helpMenuTitle)
            .setDescription(helpMenuDescription)
            .addFields(
                {
                    name: 'menu',
                    value: helpMenuOptionMenuDescription,
                    inline: true,
                },
                {
                    name: 'settings',
                    value: helpMenuOptionSettingsDescription,
                    inline: true,
                },
                {
                    name: 'formats',
                    value: helpMenuOptionFormatsDescription,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                },
                {
                    name: 'ids',
                    value: helpMenuOptionIdsDescription,
                    inline: true,
                },
                {
                    name: 'welcome-msg',
                    value: helpMenuOptionWelcomeMsgDescription,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                }
            );
    }
    else if (option === 'settings') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle(settingsHelpsTitle)
            .setDescription(settingsHelpsContent);
    }
    else if (option === 'formats') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle(formattingHelpsTitle)
            .setDescription(formattingHelpsContent);
    }
    else if (option === 'ids') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle(idsHelpsTitle)
            .setDescription(idsHelpsContent)
            .setImage('https://i.imgur.com/Dn402t2.gif');
    }
    else if (option === 'welcome-msg') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle(welcomeMsgHelpsTitle)
            .setDescription(welcomeMsgHelpsContent);
    }
    else {
        await interaction.reply({
            content: invalidOptionError,
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({
        embeds: [helpEmbed],
        components: [supportButton],
        ephemeral: true,
    });
}
export async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
        'menu',
        'settings',
        'formats',
        'ids',
        'welcome-msg',
    ];

    const filtered = choices.filter(choice => choice.startsWith(focusedValue.toLowerCase()));

    await interaction.respond(
        filtered.map(choice => ({
            name: choice,
            value: choice,
        }))
            .slice(0, 25)
    );
}