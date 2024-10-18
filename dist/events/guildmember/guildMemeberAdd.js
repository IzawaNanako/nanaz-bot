import { EmbedBuilder } from 'discord.js';
import Guild from '../../models/guild.js';
import GuildMember from '../../models/guildMember.js';
import BannedMember from '../../models/bannedMember.js';
import WelcomeRole from '../../models/welcomeRole.js';
export const name = 'guildMemberAdd';
export async function execute(member) {
    const guild = await Guild.findOne({
        where: {
            id: member.guild.id,
        }
    });
    const guildMember = await GuildMember.findOne({
        where: {
            id: member.user.id,
            guildId: member.guild.id,
        }
    });
    const bannedMember = await BannedMember.findOne({
        where: {
            id: member.user.id,
            guildId: member.guild.id,
        }
    });
    const welcomeRoles = await WelcomeRole.findAll({
        where: {
            guildId: member.guild.id,
        }
    });
    const welcomeMessage = guild.welcomeMessage;
    const welcomeEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
        name: `Hello ${member.user.username}!`,
        iconURL: member.user.displayAvatarURL({
            dynamic: true
        }),
    })
        .setTitle(`Welcome, ${member.user.displayName}!`)
        .setThumbnail(member.guild.iconURL({
        dynamic: true,
    }))
        .setDescription(`${welcomeMessage}`)
        .setFooter({
        text: `Hi, I'm Nanaz!`,
        iconURL: member.client.user.avatarURL(),
    })
        .setTimestamp();
    if (guildMember?.kicked) {
        welcomeEmbed
            .setDescription('Welcome back! Better be nicer this time!');
        guildMember.isKicked = false;
        await guildMember.save();
    }
    if (bannedMember?.totalBans > 0) {
        welcomeEmbed
            .setDescription('You seems to have a bad record, hope you have learned your lessons.');
    }
    if (guild.welcomeChannelId) {
        const welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId);
        welcomeChannel.send({
            content: `<@${member.user.id}>`,
            embeds: [welcomeEmbed],
        });
    }
    if (welcomeRoles.length > 0) {
        for (const role of welcomeRoles) {
            const welcomeRole = await member.guild.roles.fetch(role.id);
            if (welcomeRole) {
                await member.roles.add(role.id);
            }
        }
    }
}
