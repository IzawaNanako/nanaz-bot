import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

const badgeMap = {
    'HypeSquadOnlineHouse1': '<:HypeSquadBravery:1295711346931007530>',
    'HypeSquadOnlineHouse2': '<:HypeSquadBrilliance:1295711381622095904>',
    'HypeSquadOnlineHouse3': '<:HypeSquadBalance:1295711412294778931>',
    'Hypesquad': '<:HypeSquadEvents:1296418614336815215>',
    'ActiveDeveloper': '<:ActiveDeveloper:1295710776014667817>',
    'VerifiedDeveloper': '<:EarlyVerifiedBotDeveloper:1295710584330915902>',
    'BugHunterLevel1': '<:DiscordBugHunter:1295711456355942401>',
    'BugHunterLevel2': '<:DiscordGoldenBugHunter:1295711509594509358>',
    'Staff': '<:DiscordStaff:1295711569631510630>',
    'PremiumEarlySupporter': '<:EarlySupporter:1295711627395469323>',
    'Partner': '<:PartneredServerOwner:1295711670898921482>',
    'CertifiedModerator': '<:ModeratorProgramAlumni:1295711596865388584>',
    'VerifiedBot': '<:Verified:1295712821358759967>',
};

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about the selected user. Certain info can only be seen if user is in the server.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display information about.')
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
    const unknownError = i18next.t('global:unknown_error');
    const noneLiteral = i18next.t('global:none_literal');
    const unknownLiteral = i18next.t('global:unknown_literal');
    const fetchedByFooter = i18next.t('global:fetched_by_footer');
    const usernameLiteral = i18next.t('global:username_literal');
    const userIdLiteral = i18next.t('global:user_id_literal');
    const badgesLiteral = i18next.t('userinfo:badges_literal');
    const statusLiteral = i18next.t('userinfo:status_literal');
    const rolesLiteral = i18next.t('userinfo:roles_literal');
    const joinedServerAtLiteral = i18next.t('userinfo:joined_server_at_literal');
    const createdAtLiteral = i18next.t('userinfo:created_at_literal');
    const offlineLiteral = i18next.t('userinfo:offline_literal');
    const dndLiteral = i18next.t('userinfo:dnd_literal');
    const idleLiteral = i18next.t('userinfo:idle_literal');
    const onlineLiteral = i18next.t('userinfo:online_literal');
    const userinfoRandomTextOne = i18next.t('userinfo:userinfo_random_text_one');
    const userinfoRandomTextTwo = i18next.t('userinfo:userinfo_random_text_two');
    const userinfoRandomTextThree = i18next.t('userinfo:userinfo_random_text_three');
    const userinfoRandomTextFour = i18next.t('userinfo:userinfo_random_text_four');
    const userinfoRandomTextFive = i18next.t('userinfo:userinfo_random_text_five');
    const requestedByAuthor = i18next.t('global:userinfo_requested_by_author', {
        user_displayName: interaction.user.displayName,
    });

    const user = interaction.options.getUser('user') || interaction.user;

    const userInfoEmbeddTitle = i18next.t('userinfo:user_info_embed_title', {
        user_displayName: user,
    });

    const createdAtTimestamp = Math.floor(user.createdAt.getTime() / 1000);
    if (!user.flags) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    }
    const badges = user.flags.toArray()
        .map((badge) => badgeMap[badge as keyof typeof badgeMap] ?? '')
        .join(' ') || noneLiteral;
    let roles;
    let joinedAt;
    let status;

    let guildMember;
    try {
        guildMember = await interaction.guild?.members.fetch(user.id);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        if (error.code === 10007) {
            guildMember = null;
        }
        else {
            throw error;
        }
    }

    if (guildMember) {
        roles = guildMember.roles.cache.map((role) => `<@&${role.id}>`).join(`, `);
        status = guildMember.presence?.status;
        if (guildMember.joinedAt) {
            joinedAt = `<t:${Math.floor(guildMember.joinedAt.getTime() / 1000)}>`;
        }
        else {
            joinedAt = 'N/A';
        }
    }
    else {
        roles = 'N/A';
        joinedAt = 'N/A';
        status = unknownLiteral;
    }

    if (status === 'offline') {
        status = offlineLiteral;
    }
    else if (status === 'dnd') {
        status = dndLiteral;
    }
    else if (status === 'idle') {
        status = idleLiteral;
    }
    else if (status === 'online') {
        status = onlineLiteral;
    }

    const infoTextNum = Math.floor(Math.random() * 5);
    const infoTexts = [
        userinfoRandomTextOne,
        userinfoRandomTextTwo,
        userinfoRandomTextThree,
        userinfoRandomTextFour,
        userinfoRandomTextFive,
    ];

    const userInfoEmbed = new EmbedBuilder()
        .setColor('#03A9F4')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(userInfoEmbeddTitle)
        .setDescription(infoTexts[infoTextNum])
        .setThumbnail(user.displayAvatarURL())
        .addFields([
            {
                name: usernameLiteral,
                value: `${user.username}`,
                inline: true,
            },
            {
                name: userIdLiteral,
                value: `\`\`\`${user.id}\`\`\``,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: badgesLiteral,
                value: `${badges}`,
                inline: true,
            },
            {
                name: statusLiteral,
                value: `${status}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: rolesLiteral,
                value: `${roles}`,
                inline: true,
            },
            {
                name: joinedServerAtLiteral,
                value: `${joinedAt}`,
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
        embeds: [userInfoEmbed],
        components: [supportButton],
    });
}