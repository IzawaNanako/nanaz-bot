import { EmbedBuilder, GuildMember as Member, PermissionFlagsBits, TextChannel } from 'discord.js';
import Guild from '../../models/guild.js';
import GuildMember from '../../models/guildMember.js';
import BannedMember from '../../models/bannedMember.js';
import i18next from 'i18next';

export const name = 'guildMemberRemove';
export async function execute(member: Member) {
    const guild = await Guild.findOne({
        where: {
            id: member.guild.id,
        }
    });
    if (!guild || !guild.byeChannelId || !member.guild.members.me?.permissionsIn(guild.byeChannelId).has(PermissionFlagsBits.SendMessages)) {
        return;
    }

    i18next.setDefaultNamespace('events');
    i18next.changeLanguage(guild.language);
    const byeEmbedAuthor = i18next.t('guildMemberRemove.byeEmbedAuthor', {
        username: member.user.username,
    });
    const byeEmbedTitle = i18next.t('guildMemberRemove.byeEmbedTitle', {
        userDisplayName: member.user.username,
    });
    const byeEmbedDescription = i18next.t('guildMemberRemove.byeEmbedDescription');
    const byeEmbedFooter = i18next.t('guildMemberRemove.byeEmbedFooter');

    const byeChannel = await member.guild.channels.fetch(guild.byeChannelId) as TextChannel;
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
            name: byeEmbedAuthor,
            iconURL: member.user.displayAvatarURL(),
        })
        .setTitle(byeEmbedTitle)
        .setThumbnail(member.guild.iconURL())
        .setDescription(byeEmbedDescription)
        .setFooter({
            text: byeEmbedFooter,
            iconURL: member.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    byeChannel.send({
        embeds: [byeEmbed],
    });
}