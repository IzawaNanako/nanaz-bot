import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display information about a server the bot is in.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addStringOption(option => option
        .setName('server-id')
        .setDescription('The ID of the server to display information about. "/help ids" for how to get IDs.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
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
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const fetchedByFooter = i18next.t('global:fetched_by_footer');
    const invalidServerError = i18next.t('serverinfo:invalid_server_error');
    const serverInformationLiteral = i18next.t('serverinfo:server_information_literal');
    const serverNameLiteral = i18next.t('serverinfo:server_name_literal');
    const serverOwnerLiteral = i18next.t('serverinfo:server_owner_literal');
    const serverIdLiteral = i18next.t('serverinfo:server_id_literal');
    const totalMembersLiteral = i18next.t('serverinfo:total_members_literal');
    const boostCountLiteral = i18next.t('serverinfo:boost_count_literal');
    const boostLevelLiteral = i18next.t('serverinfo:boost_level_literal');
    const roleCountLiteral = i18next.t('serverinfo:role_count_literal');
    const channelCountLiteral = i18next.t('serverinfo:channel_count_literal');
    const customEmojiCountLiteral = i18next.t('serverinfo:custom_emoji_count_literal');
    const createdAtLiteral = i18next.t('serverinfo:created_at_literal');
    const serverRandomTextOne = i18next.t('serverinfo:serverinfo_random_text_one');
    const serverRandomTextTwo = i18next.t('serverinfo:serverinfo_random_text_two');
    const serverRandomTextThree = i18next.t('serverinfo:serverinfo_random_text_three');
    const serverRandomTextFour = i18next.t('serverinfo:serverinfo_random_text_four');
    const serverRandomTextFive = i18next.t('serverinfo:serverinfo_random_text_five');

    const serverId = interaction.options.getString('server-id') || interaction.guild?.id;
    let server;
    if (serverId) {
        server = await interaction.client.guilds.fetch(serverId);
    }
    if (!server) {
        await interaction.reply({
            content: invalidServerError,
            ephemeral: true,
        });
        return;
    }

    const createdAtTimestamp = Math.floor(server.createdAt.getTime() / 1000);
    const owner = await server.members.fetch(server.ownerId);

    const infoTextNum = Math.floor(Math.random() * 5);
    const infoTexts = [
        serverRandomTextOne,
        serverRandomTextTwo,
        serverRandomTextThree,
        serverRandomTextFour,
        serverRandomTextFive,
    ];

    const serverInfoEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(serverInformationLiteral)
        .setDescription(infoTexts[infoTextNum])
        .setThumbnail(server.iconURL())
        .addFields([
            {
                name: serverNameLiteral,
                value: `${server.name}`,
                inline: true,
            },
            {
                name: serverOwnerLiteral,
                value: `${owner.user}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: serverIdLiteral,
                value: `\`\`\`${server.id}\`\`\``,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: totalMembersLiteral,
                value: `${server.memberCount}`,
                inline: true,
            },
            {
                name: boostCountLiteral,
                value: `${server.premiumSubscriptionCount}`,
                inline: true,
            },
            {
                name: boostLevelLiteral,
                value: `${server.premiumTier}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: roleCountLiteral,
                value: `${server.roles.cache.size}`,
                inline: true,
            },
            {
                name: channelCountLiteral,
                value: `${server.channels.cache.size}`,
                inline: true,
            },
            {
                name: customEmojiCountLiteral,
                value: `${server.emojis.cache.size}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: createdAtLiteral,
                value: `<t:${createdAtTimestamp}>`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            }
        ])
        .setFooter({
            text: fetchedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [serverInfoEmbed],
        components: [supportButton],
    });
}