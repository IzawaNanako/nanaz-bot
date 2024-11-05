import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import BannedMember from '../../models/bannedMember.js';
import sendLog from '../../utils/sendLog.js';
import supportButton from '../../utils/supportButton.js';
export const data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban selected user that is banned from the server.')
    .addStringOption(option => option
    .setName('username')
    .setDescription('The username of the user to unban.')
    .setRequired(true))
    .addBooleanOption(option => option
    .setName('notice')
    .setDescription('To inform the user that they have been unbanned. By default, this is set to true.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(0);
export async function execute(interaction) {
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({
            content: 'I don\'t have permission to manage bans in this server!',
            ephemeral: true,
        });
        return;
    }
    const username = interaction.options.get('username')?.value;
    const notice = interaction.options.get('notice')?.value || true;
    const bannedMember = await BannedMember.findOne({
        where: {
            username: username,
            isBanned: true,
            guildId: interaction.guild.id,
        }
    });
    if (!bannedMember) {
        await interaction.reply({
            content: 'This user is not banned from this server.',
            ephemeral: true,
        });
        return;
    }
    const user = await interaction.client.users.fetch(bannedMember.id);
    const unbanEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🔓 Member Unbanned')
        .addFields([
        {
            name: 'User: ',
            value: `${user}`,
            inline: true,
        },
        {
            name: '\u200B',
            value: '\u200B',
            inline: true,
        },
        {
            name: 'Issued by: ',
            value: `${interaction.user}`,
            inline: true,
        },
    ])
        .setTimestamp()
        .setFooter({
        text: 'The user can join the server now.',
        iconURL: interaction.client.user.avatarURL() ?? undefined,
    });
    const unbannedNotice = `${interaction.user} unbanned you from **${interaction.guild.name}**!`;
    if (!user.bot && notice) {
        await user.send(unbannedNotice);
    }
    bannedMember.update({
        isBanned: false,
        bannedBy: null,
        bannedReason: null,
        bannedAt: null,
        bannedUntil: null,
    });
    await interaction.reply({
        embeds: [unbanEmbed],
        components: [supportButton],
    });
    await interaction.guild.members.unban(bannedMember.id);
    await sendLog(interaction.guild, {
        embeds: [unbanEmbed],
    });
}
