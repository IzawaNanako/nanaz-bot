const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
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
        const expireDate = bannedMember.bannedUntil ?? 'Never';

        if (!bannedMember) {
            await interaction.reply({
                content: 'This user has never been banned from this server.',
                ephemeral: true,
            })
        }

        const banInfoEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Ban Information')
            .setTimestamp()
            .setFooter({
                text: 'Fetched by Nanaz.',
                iconURL: interaction.client.user.avatarURL(),
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
                        value: `${bannedMember.reason}`,
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
        });
    }
}