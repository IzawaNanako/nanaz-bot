const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Display the icon of the selected server.')
        .addStringOption(option => option
            .setName('server')
            .setDescription('The id of the server to display the icon of.')
        ),
    async execute(interaction) {
        const guildID = interaction.options.getString('server') || interaction.guild;
        const server = await interaction.client.guilds.fetch(guildID);
        const serverIcon = server.iconURL({
            dynamic: true,
            size: 2048,
        });

        if (!serverIcon) {
            await interaction.reply({
                content: 'Invalid Server ID.',
                ephemeral: true
            });
            return;
        }

        const serverIconEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `Requested by ${interaction.user.username}`,
            })
            .setTitle(`Server Icon of ${server.name}`)
            .setDescription(`Icon URL: ${serverIcon}`)
            .setImage(serverIcon)
            .setFooter({
                text: `Displayed by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [serverIconEmbed],
        });
    }
}