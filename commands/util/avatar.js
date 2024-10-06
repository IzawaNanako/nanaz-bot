const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display the avatar of the selected user.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to display the avatar of.')
        )
        .addBooleanOption(option => option
            .setName('default_avatar')
            .setDescription('Display the user\'s default avatar instead of their avatar in the server.')
        ),
    async execute(interaction) {
        const member = interaction.options.getUser('user') || interaction.user;
        const defaultAvatar = interaction.options.getBoolean('default_avatar') || false;
        
        let avatarEmbed;

        if (defaultAvatar && !member.bot) {
            avatarEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({
                    name: `Requested by ${interaction.user.username}`,
                })
                .setTitle(`${member.username}'s Avatar`)
                .setDescription(`Avatar URL: ${member.displayAvatarURL()}`)
                .setImage(member.avatarURL({
                    dynamic: true,
                    size: 2048,
                }))
                .setFooter({
                    text: `Displayed by Nanaz`,
                    iconURL: interaction.client.user.avatarURL(),
                })
                .setTimestamp();
        }
        else {
            avatarEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({
                    name: `Requested by ${interaction.user.username}`,
                })
                .setTitle(`${member.username}'s Avatar`)
                .setDescription(`Avatar URL: ${member.displayAvatarURL()}`)
                .setImage(member.displayAvatarURL({
                    dynamic: true,
                    size: 2048,
                }))
                .setFooter({
                    text: `Displayed by Nanaz`,
                    iconURL: interaction.client.user.avatarURL(),
                })
                .setTimestamp();
        }

        await interaction.reply({
            embeds: [avatarEmbed],
        });
    }
}