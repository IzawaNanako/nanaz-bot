const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const BannedMember = require('../../models/bannedMember.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban selected user that is banned from the server.')
        .addStringOption(option => option
            .setName('username')
            .setDescription('The username of the user to unban.')
            .setRequired(true)
        )
        .addBooleanOption(option => option
            .setName('notice')
            .setDescription('To inform the user that they have been unbanned. By default, this is set to true.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(0),
	async execute(interaction) {
		const username = interaction.options.getString('username');
        const notice = interaction.options.getBoolean('notice') ?? true;
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id
            }
        });
        const bannedMember = await BannedMember.findOne({
            where: {
                username: username,
                banned: true,
                guildId: guild.id,
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
                iconURL: interaction.client.user.avatarURL(),
            });

        const unbannedNotice = `${interaction.user} unbanned you from **${interaction.guild.name}**!`;

        if (!user.bot && notice) {
            await user.send(unbannedNotice);
        }

        bannedMember.isBanned = false;
        bannedMember.bannedBy = null;
        bannedMember.bannedReason = null;
        bannedMember.bannedAt = null;
        bannedMember.bannedUntil = null;
        await bannedMember.save();

        await interaction.reply({
            embeds: [unbanEmbed],
        });
        await interaction.guild.members.unban(bannedMember.id);

        await sendLog(interaction.guild, {
            embeds: [unbanEmbed],
        });
	},
};