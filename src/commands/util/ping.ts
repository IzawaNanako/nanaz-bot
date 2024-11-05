import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the current latency of the bot.');
export async function execute(interaction: CommandInteraction) {
    const pingEmbed = new EmbedBuilder()
        .setColor('#808080')
        .setAuthor({
            name: `Requested by ${interaction.user.displayName}`,
        })
        .setTitle('Pinging...')
        .setFooter({
            text: 'Pinged by Nanaz',
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    const msg = await interaction.reply({
        embeds: [pingEmbed],
        fetchReply: true,
    });

    await interaction.editReply({
        embeds: [
            pingEmbed
                .setColor(Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 200 ? '#00FF00' : Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 400 ? '#FFFF00' : '#FF0000')
                .setTitle('Pong!')
                .addFields([
                    {
                        name: 'Latency',
                        value: `${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms`,
                    }
                ])
        ],
        components: [supportButton],
    });
}