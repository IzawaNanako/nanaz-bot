import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display the avatar of the selected user.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display the avatar of.')
    )
    .addBooleanOption(option => option
        .setName('default_avatar')
        .setDescription('Display the user\'s default avatar instead of their avatar in the server.')
    );
export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.get('user')?.user || interaction.user;
    const defaultAvatar = interaction.options.get('default_avatar')?.value as boolean || false;

    const avatarEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({
            name: `Requested by ${interaction.user.displayName}`,
        })
        .setTitle(`${user.displayName}'s Avatar`)
        .setFooter({
            text: `Displayed by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    if (defaultAvatar && !user.bot) {
        avatarEmbed
            .setDescription(`Avatar URL: ${user.avatarURL()}`)
            .setImage(user.avatarURL({
                size: 2048,
            }));
    }
    else {
        avatarEmbed
            .setDescription(`Avatar URL: ${user.displayAvatarURL()}`)
            .setImage(user.displayAvatarURL({
                size: 2048,
            }));
    }

    await interaction.reply({
        embeds: [avatarEmbed],
        components: [supportButton],
    });
}