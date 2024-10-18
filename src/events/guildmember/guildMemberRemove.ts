import { EmbedBuilder } from 'discord.js';
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
            iconURL: member.user.displayAvatarURL({
                dynamic: true
            }),
        })
        .setTitle(`Goodbye, ${member.user.displayName}!`)
        .setThumbnail(member.guild.iconURL({
            dynamic: true,
        }))
        .setDescription(`We are sad to see you go...`)
        .setFooter({
            text: `I hope to see you next time!`,
            iconURL: member.client.user.avatarURL(),
        })
        .setTimestamp();

    if (guild.byeChannelId) {
        const byeChannel = await member.guild.channels.fetch(guild.byeChannelId);
        byeChannel.send({
            embeds: [byeEmbed],
        });
    }
}