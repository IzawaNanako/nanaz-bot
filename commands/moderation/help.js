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
        )
        .setContexts(0),
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
                .setDescription('The welcome message to send to new members of this server.\nDefault: "Thank you for joining ${member.guild.name}!"\nFormatting tips: Use "${member.guild.name}" or just enter the server name for the server name, "${member.user.username}" for the new member\'s username, and "${member.user.displayName}" for the display name, user ${member.user} to make the user\'s name clickable.\nUse "\\n" to make a new line.\nIf you wish to disable the welcome message feature, use "/set-channel Welcome" and leave the channel empty to disable it.\n\nIf you need any extra assist, please join our support server: https://discord.gg/vh2gSBESnh')
                .setTimestamp()
                .setFooter({
                    text: 'Assisted by Nanaz.',
                    iconURL: interaction.client.user.avatarURL(),
                });
        }

        await interaction.reply({
            embeds: [helpEmbed]
        });
    }
}