import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
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
    if (!guild) {
        return;
    }
    let welcomeChannel;
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
    if (guild.welcomeChannelId && welcomeChannel && member.guild.members.me?.permissionsIn(guild.welcomeChannelId).has(PermissionFlagsBits.SendMessages)) {
        welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId);
        const welcomeMessage = guild.welcomeMessage;
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
            name: `Hello ${member.user.username}!`,
            iconURL: member.user.displayAvatarURL(),
        })
            .setTitle(`Welcome, ${member.user.displayName}!`)
            .setThumbnail(member.guild.iconURL())
            .setDescription(`${welcomeMessage}`)
            .setFooter({
            text: `Hi, I'm Nanaz!`,
            iconURL: member.client.user.avatarURL() ?? undefined,
        })
            .setTimestamp();
        if (guildMember?.isKicked) {
            welcomeEmbed
                .setDescription('Welcome back! Better be nicer this time!');
            guildMember.isKicked = false;
            await guildMember.save();
        }
        if (bannedMember?.isBanned && bannedMember?.totalBans > 0) {
            welcomeEmbed
                .setDescription('You seems to have a bad record, hope you have learned your lessons.');
        }
        welcomeChannel.send({
            content: `${member.user}`,
            embeds: [welcomeEmbed],
        });
    }
    if (welcomeRoles.length > 0 && member.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        for (const role of welcomeRoles) {
            const welcomeRole = await member.guild.roles.fetch(role.id);
            if (welcomeRole) {
                await member.roles.add(role.id);
            }
        }
    }
}
