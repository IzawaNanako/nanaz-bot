import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandType, EmbedBuilder, UserContextMenuCommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new ContextMenuCommandBuilder()
    .setName('User Banner')
    .setType(ApplicationCommandType.User as ContextMenuCommandType);
export async function execute(interaction: UserContextMenuCommandInteraction) {
    const user = interaction.targetUser;
    const member = await user.fetch();

    if (!member.bannerURL()) {
        await interaction.reply({
            content: 'This user does not have a banner.',
            ephemeral: true,
        });
        return;
    }

    const bannerEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`${member.displayName}'s Profile Banner`)
        .setDescription(`Banner URL: ${member.bannerURL()}`)
        .setImage(member.bannerURL({
            size: 2048,
        }) ?? null)
        .setFooter({
            text: `Displayed by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [bannerEmbed],
        components: [supportButton],
        ephemeral: true,
    });
}