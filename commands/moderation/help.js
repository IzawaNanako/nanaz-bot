const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help on certain features of this bot.')
        .addStringOption(option => option
            .setName('feature')
            .setDescription('The feature to get help on.')
            .addChoices(
                {
                    name: 'Welcome Message',
                    value: 'welcome-msg',
                }
            )
        ),
    async execute(interaction) {
        const feature = interaction.options.getString('feature');

        let helpEmbed;

        if (!feature) {
            helpEmbed = new EmbedBuilder()
                .setColor('#2E4053')
                .setTitle('Help Menu')
                .setDescription('Below is a list of the features available for help.')
                .addFields(
                    {
                        name: 'Welcome Message',
                        value: 'Get help on the welcome message feature.',
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: 'Assisted by Nanaz.',
                    iconURL: interaction.client.user.avatarURL(),
                });
        }

        if (feature === 'welcome-msg') {
            helpEmbed = new EmbedBuilder()
                .setColor('#2E4053')
                .setTitle('Welcome Message Helps')
                .setDescription('The welcome message to send to new members of this server.\n\nDefault: "Thank you for joining ${member.guild.name}!"\n\nFormatting tips:\nUse "${member.guild.name}" or just enter the server name for the server name.\nUse "${member.user.username}" for the new member\'s username.\nUse "${member.user.displayName}" for the display name.\nUse "${member.user}" to make the user\'s name clickable.\n\nUse "\\n" to make a new line.\n\nIf you wish to disable the welcome message feature, use "/set-channel Welcome" and leave the channel option empty to disable it.\n\n\nIf you need any extra assist, please contact us through our support server: https://discord.gg/vh2gSBESnh')
                .setTimestamp()
                .setFooter({
                    text: 'Assisted by Nanaz.',
                    iconURL: interaction.client.user.avatarURL(),
                });
        }

        await interaction.reply({
            embeds: [helpEmbed],
            ephemeral: true,
        });
    }
}