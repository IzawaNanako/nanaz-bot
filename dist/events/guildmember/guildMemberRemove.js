import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../models/guild.js';
import GuildMember from '../../models/guildMember.js';
import BannedMember from '../../models/bannedMember.js';
export const name = 'guildMemberRemove';
export async function execute(member) {
    const guild = await Guild.findOne({
        where: {
            id: member.guild.id,
        }
    });
    if (!guild || !guild.byeChannelId || !member.guild.members.me?.permissionsIn(guild.byeChannelId).has(PermissionFlagsBits.SendMessages)) {
        return;
    }
    const byeChannel = await member.guild.channels.fetch(guild.byeChannelId);
    if (!byeChannel) {
        return;
    }
    const guildMember = await GuildMember.findOne({
        where: {
            id: member.id,
            guildId: member.guild.id,
        }
    });
    const bannedMember = await BannedMember.findOne({
        where: {
            id: member.id,
            guildId: member.guild.id,
        }
    });
    if (guildMember?.isKicked || bannedMember?.isBanned) {
        return;
    }
    const byeEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setAuthor({
        name: `Farewell ${member.user.username}!`,
        iconURL: member.user.displayAvatarURL(),
    })
        .setTitle(`Goodbye, ${member.user.displayName}!`)
        .setThumbnail(member.guild.iconURL())
        .setDescription(`We are sad to see you go...`)
        .setFooter({
        text: `I hope to see you next time!`,
        iconURL: member.client.user.avatarURL() ?? undefined,
    })
        .setTimestamp();
    byeChannel.send({
        embeds: [byeEmbed],
    });
}
