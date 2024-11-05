import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Display the banner of the selected user.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display the banner of.')
    );
export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.get('user')?.user || interaction.user;
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
        .setAuthor({
            name: `Requested by ${interaction.user.displayName}`,
        })
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
    });
}