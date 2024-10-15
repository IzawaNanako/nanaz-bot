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
        
        const avatarEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle(`${member.displayName}'s Avatar`)
            .setFooter({
                text: `Displayed by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();

        if (defaultAvatar && !member.bot) {
            avatarEmbed
                .setDescription(`Avatar URL: ${member.avatarURL()}`)
                .setImage(member.avatarURL({
                    dynamic: true,
                    size: 2048,
                }));
        }
        else {
            avatarEmbed
                .setDescription(`Avatar URL: ${member.displayAvatarURL()}`)
                .setImage(member.displayAvatarURL({
                    dynamic: true,
                    size: 2048,
                }));
        }

        await interaction.reply({
            embeds: [avatarEmbed],
        });
    }
}