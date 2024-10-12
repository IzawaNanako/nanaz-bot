const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const GuildMember = require('../../models/guildMember.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick selected member from the server.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to kick.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason you are kicking this user for.')
    )
    .addBooleanOption(option => option
        .setName('notice')
        .setDescription('To inform the user that they have been kicked. By default, this is set to true.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setContexts(0),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');
        const notice = interaction.options.getBoolean('notice') ?? true;
        const [ guild ] = await Guild.findOrCreate({
            where: {
                id: interaction.guild.id,
            }
        });

        const [ guildMember ] = await GuildMember.findOrCreate({
            where: {
                id: member.user.id,
                guildId: guild.id,
            }
        })
        
        if (member.user.id === interaction.user.id) {
            await interaction.reply({
                content: 'What the heck are you doing?',
            });
            return;
        }

        if (!member.bannable) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('🚫 | I can\'t seem to kick that user.\nTry checking my kick permission.'),
                ], 
                ephemeral: true,
            });
            return;
        }

        const kickMsgID = Math.floor(Math.random() * 5);
        const kickMsgs = [
            'They have seen better days...',
            'They\'ll probably not be missed.',
            'They\'ll be missed.',
            'I\'m going to miss you.',
            'I\'m sorry. I\'m sorry. I\'m sorry.'
        ];

        const kickEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('👋 Member Kicked')
        .setDescription(kickMsgs[kickMsgID])
        .addFields([
            {
                name: 'User: ',
                value: `${member.user}`,
                inline: true,
            },
            {
                name: 'Issued by: ',
                value: `${interaction.user}`,
                inline: true,
            },
        ])
        .setImage('https://i.imgur.com/3RiBEiw.gif')
        .setTimestamp()
        .setFooter({
            text: 'The user can join back at anytime.',
            iconURL: interaction.client.user.avatarURL(),
        });

        let kickedNotice = `${interaction.user} kicked you from **${interaction.guild.name}**.`;
        if (reason) {
            kickedNotice += ` Reason: ${reason}`;
            kickEmbed
            .addFields({
                name: 'Reason: ',
                value: reason,
            });
        }

        if (!member.user.bot && notice) {
            await member.send(kickedNotice);
        }

        guildMember.kicked = true;
        await guildMember.save();

        await interaction.reply({
            embeds: [kickEmbed],
        });
        await member.kick();

        await sendLog(interaction.guild, {
            embeds: [kickEmbed],
        });
	},
};