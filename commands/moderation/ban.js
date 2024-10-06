const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban selected member from the server.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to ban.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason you are banning this user for.')
        )
        .addNumberOption(option => option
            .setName('delete_messages')
            .setDescription('How recent should their message be deleted in days? (Max 7, default 0, accepts decimals).')
        )
        .addBooleanOption(option => option
            .setName('notice')
            .setDescription('To inform the user that they have been banned. By default, this is set to true.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(0),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');
        const delDays = interaction.options.getNumber('delete_messages') || 0;
        const notice = interaction.options.getBoolean('notice') || true;
        
        if (member.user.id === interaction.user.id) {
            await interaction.reply({
                content: 'Bruh.',
            });
            return;
        }

        if (delDays < 0 || delDays > 7) {
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('🚫 | Please choose a number between 0 and 7.'),
                ], 
                ephemeral: true,
            });
            return;
        }

        if (!member.bannable) {
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('🚫 | I can\'t seem to ban that user.\nTry checking my ban permission.'),
                ], 
                ephemeral: true,
            });
            return;
        }

        const banMsgID = Math.floor(Math.random() * 5);
        const banMsgs = [
            'Be gone!',
            'They disgusted me.',
            'Who knows, maybe they\'ll be back someday?',
            'That\'s what you get.',
            'No tolerance.'
        ];

        const banEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('<:banhammer:1292141718279557162> Member Banned')
            .setDescription(banMsgs[banMsgID])
            .addFields([
                {
                    name: 'User: ',
                    value: `${member.user}`,
                    inline: true
                },
                {
                    name: 'Issued by: ',
                    value: `${interaction.user}`,
                    inline: true
                },
            ])
            .setImage('https://i.imgur.com/ioBFfq3.gif')
            .setTimestamp()
            .setFooter({
                text: 'Check Server Settings -> Bans to see the ban info, or to revoke the ban.',
                iconURL: interaction.client.user.avatarURL(),
            });

        let bannedNotice = `${interaction.user} banned you from **${interaction.guild.name}**.`;
        if (reason) {
            bannedNotice += ` Reason: ${reason}`;
            banEmbed.addFields({
                    name: 'Reason: ',
                    value: reason,
                }
            );
        }

        if (!member.user.bot && notice) {
            await member.send(bannedNotice);
        }

        const delSecs = Math.round(delDays * 86400);

        await interaction.reply({
            embeds: [banEmbed],
        });
        await interaction.guild.members.ban(member, {
            reason: reason || 'No reason provided.',
            deleteMessageSeconds: delSecs,
        });
	},
};