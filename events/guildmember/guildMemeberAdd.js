const { EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const GuildMember = require('../../models/guildMember.js');
const BannedMember = require('../../models/bannedMember.js');
const WelcomeRole = require('../../models/welcomeRole.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const guild = await Guild.findOne({
            where: {
                id: member.guild.id,
            }
        });

        const guildMember = await GuildMember.findOne({
            where: {
                id: member.user.id,
                guildId: guild.id,
            }
        });

        const bannedMember = await BannedMember.findOne({
            where: {
                id: member.user.id,
                guildId: guild.id,
            }
        });

        const welcomeRoles = await WelcomeRole.findAll({
            where: {
                guildId: guild.id,
            }
        });

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
            .setDescription(`Thank you for joining ${member.guild.name}!`)
            .setFooter({
                text: `Hi, I'm Nanaz!`,
                iconURL: member.client.user.avatarURL(),
            })
            .setTimestamp();
        
        if (guildMember?.kicked) {
            welcomeEmbed
            .setDescription('Welcome back! Better be nicer this time!');

            guildMember.kicked = false;
            await guildMember.save();
        }

        if (bannedMember?.banned) {
            welcomeEmbed
            .setDescription('Welcome back! Hope you have learned your lessons.');

            bannedMember.banned = false;
            await bannedMember.save();
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
}