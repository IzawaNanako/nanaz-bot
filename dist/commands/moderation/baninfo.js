import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import BannedMember from '../../models/bannedMember.js';
import supportButton from '../../utils/supportButton.js';
export const data = new SlashCommandBuilder()
    .setName('baninfo')
    .setDescription('Get information about a user\'s ban status on this server.')
    .addStringOption(option => option
    .setName('username')
    .setDescription('The username of the user to get information about.')
    .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(0);
export async function execute(interaction) {
    if (!interaction.guild) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    const username = interaction.options.get('username', true).value;
    const bannedMember = await BannedMember.findOne({
        where: {
            guildId: interaction.guild.id,
            username: username,
        }
    });
    if (!bannedMember) {
        await interaction.reply({
            content: 'This user has never been banned from this server.',
            ephemeral: true,
        });
        return;
    }
    const expireDate = bannedMember.bannedUntil ?? 'Never';
    const banInfoEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Ban Information')
        .setTimestamp()
        .setFooter({
        text: 'Fetched by Nanaz.',
        iconURL: interaction.client.user.avatarURL() ?? undefined,
    });
    if (bannedMember.isBanned) {
        banInfoEmbed
            .setDescription(`This user is currently banned from this server.`)
            .addFields([
            {
                name: 'Username: ',
                value: `${bannedMember.username}`,
                inline: true,
            },
            {
                name: 'User ID: ',
                value: `\`${bannedMember.id}\``,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Issued by: ',
                value: `${interaction.user}`,
                inline: true,
            },
            {
                name: 'Reason: ',
                value: `${bannedMember.bannedReason}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Banned At: ',
                value: `${bannedMember.bannedAt}`,
                inline: true,
            },
            {
                name: 'Expires At: ',
                value: `${expireDate}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Total Bans: ',
                value: `${bannedMember.totalBans}`,
            },
        ]);
    }
    else {
        banInfoEmbed
            .setDescription('This user is currently not banned from this server.')
            .addFields([
            {
                name: 'User: ',
                value: `${bannedMember.username}`,
                inline: true,
            },
            {
                name: 'User ID: ',
                value: `\`\`\`${bannedMember.id}\`\`\``,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
            },
            {
                name: 'Total Bans: ',
                value: `${bannedMember.totalBans}`,
                inline: true,
            }
        ]);
    }
    await interaction.reply({
        embeds: [banInfoEmbed],
        components: [supportButton],
    });
}
