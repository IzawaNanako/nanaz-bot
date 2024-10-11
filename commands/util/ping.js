const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check the current latency of the bot.'),
	async execute(interaction) {
        let pingEmbed = new EmbedBuilder()
            .setColor('#808080')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle('Pinging...')
            .setFooter({
                text: 'Displayed by Nanaz',
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
        });
	},
};