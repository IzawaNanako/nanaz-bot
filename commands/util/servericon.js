const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Display the icon of the selected server.')
        .addStringOption(option => option
            .setName('server')
            .setDescription('The ID of the server to display the icon of. "/help ids" for how to get IDs.')
        ),
    async execute(interaction) {
        const serverID = interaction.options.getString('server') || interaction.guild.id;

        if (!serverID) {
            await interaction.reply({
                content: 'Invalid Server ID.',
                ephemeral: true,
            });
            return;
        }

        const server = await interaction.client.guilds.fetch(serverID);
        const serverIcon = server.iconURL({
            dynamic: true,
            size: 2048,
        });

        if (!serverIcon) {
            await interaction.reply({
                content: 'Invalid Server ID.',
                ephemeral: true,
            });
            return;
        }

        const serverIconEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
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