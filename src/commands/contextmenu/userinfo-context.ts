import { ContextMenuCommandBuilder, EmbedBuilder, CommandInteraction, ApplicationCommandType, ContextMenuCommandType, UserContextMenuCommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new ContextMenuCommandBuilder()
    .setName('User Info')
    .setType(ApplicationCommandType.User as ContextMenuCommandType)
    .setContexts(0);
export async function execute(interaction: UserContextMenuCommandInteraction) {
    const user = interaction.targetUser;
    const createdAtTimestamp = Math.floor(user.createdAt.getTime() / 1000);
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
    if (!user.flags) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    const guildMember = await interaction.guild?.members.fetch(user.id);
    const badges = user.flags.toArray()
        .map((badge) => badgeMap[badge as keyof typeof badgeMap] ?? '')
        .join(' ') || 'None';
    let roles;
    let joinedAt;
    let status;

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
        status = 'Unknown';
    }

    if (status === 'offline') {
        status = 'Offline';
    }
    else if (status === 'dnd') {
        status = 'Do Not Disturb';
    }
    else if (status === 'idle') {
        status = 'Idle';
    }
    else if (status === 'online') {
        status = 'Online';
    }

    const infoTextNum = Math.floor(Math.random() * 5);
    const infoTexts = [
        'Remember, I\'m always watching...',
        'What\'s interesting about this person?',
        'Any secrets you found?',
        'Damn, look at those roles!',
        'Eh, this person seems boring.'
    ];

    const userInfoEmbed = new EmbedBuilder()
        .setColor('#03A9F4')
        .setTitle(`${user.displayName}'s User Information`)
        .setDescription(infoTexts[infoTextNum])
        .setThumbnail(user.displayAvatarURL())
        .addFields([
            {
                name: 'Username',
                value: `${user.username}`,
                inline: true,
            },
            {
                name: 'User ID',
                value: `\`\`\`${user.id}\`\`\``,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Badges',
                value: `${badges}`,
                inline: true,
            },
            {
                name: 'Status',
                value: `${status}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Roles',
                value: `${roles}`,
                inline: true,
            },
            {
                name: 'Joined Server At',
                value: `${joinedAt}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Created at',
                value: `<t:${createdAtTimestamp}>`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            }
        ])
        .setFooter({
            text: `Fetched by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [userInfoEmbed],
        components: [supportButton],
        ephemeral: true
    });
}