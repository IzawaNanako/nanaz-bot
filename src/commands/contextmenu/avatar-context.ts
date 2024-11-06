import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandType, EmbedBuilder, UserContextMenuCommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new ContextMenuCommandBuilder()
    .setName('User Avatar')
    .setType(ApplicationCommandType.User as ContextMenuCommandType);
export async function execute(interaction: UserContextMenuCommandInteraction) {
    const user = interaction.targetUser;

    const avatarEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`${user.displayName}'s Avatar`)
        .setFooter({
            text: `Displayed by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    if (user.bot) {
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
        ephemeral: true,
    });
}