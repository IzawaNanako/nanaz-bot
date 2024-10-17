const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supportButton = require('../../utils/supportButton.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the current latency of the bot.'),
    async execute(interaction) {
        const pingEmbed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('Pinging...')
            .setFooter({
                text: 'Pinged by Nanaz',
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();

        let msg = await interaction.reply({
            embeds: [pingEmbed],
            fetchReply: true,
        });

        await interaction.editReply({
            embeds: [
                pingEmbed
                    .setColor(Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 200 ? '#00FF00' : Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 400 ? '#FFFF00' : '#FF0000')
                    .setTitle('Pong!')
                    .addFields([
                        {
                            name: 'Latency',
                            value: `${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms`,
                        }
                    ])
            ],
            components: [supportButton],
        });
	},
};