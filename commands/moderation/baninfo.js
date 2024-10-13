const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const BannedMember = require('../../models/bannedMember.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baninfo')
        .setDescription('Get information about a user\'s ban status on this server.')
        .addStringOption(option => option
            .setName('username')
            .setDescription('The username of the user to get information about.')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(0),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const bannedMember = await BannedMember.findOne({
            guildId: interaction.guild.id,
            username: username,
        });

        if (!bannedMember) {
            await interaction.reply({
                content: 'This user has never been banned from this server.',
                ephemeral: true,
            })
        }

        let banInfoEmbed;

        if (bannedMember.isBanned) {
            banInfoEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Ban Information')
                .setDescription(`This user is currently banned from this server.`)
                .addFields([
                    {
                        name: 'User: ',
                        value: `${bannedMember.username}`,
                        inline: true,
                    },
                    {
                        name: 'Issued by: ',
                        value: `${interaction.user}`,
                        inline: true,
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                    },
                    {
                        name: 'Reason: ',
                        value: `${bannedMember.reason}`,
                        inline: true,
                    },
                    {
                        name: 'Total Bans: ',
                        value: `${bannedMember.totalBans}`,
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
                        value: `${bannedMember.bannedUntil}`,
                        inline: true,
                    }
                ])
                .setTimestamp()
                .setFooter({
                    text: 'Fetched by Nanaz.',
                    iconURL: interaction.client.user.avatarURL(),
                });
        }
        else {
            banInfoEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Ban Information')
                .setDescription('This user is currently not banned from this server.')
                .addFields([
                    {
                        name: 'User: ',
                        value: `${bannedMember.username}`,
                        inline: true,
                    },
                    {
                        name: 'Total Bans: ',
                        value: `${bannedMember.totalBans}`,
                        inline: true,
                    }
                ])
                .setTimestamp()
                .setFooter({
                    text: 'Fetched by Nanaz.',
                    iconURL: interaction.client.user.avatarURL(),
                });
        }

        await interaction.reply({
            embeds: [banInfoEmbed],
        });
    }
}