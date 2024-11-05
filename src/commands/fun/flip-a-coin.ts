import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('flip-a-coin')
    .setDescription('Flip a coin!');
export const execute = async (interaction: CommandInteraction) => {
    const coinEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setAuthor({
            name: `Requested by ${interaction.user.displayName}`,
        })
        .setTitle('Flip a Coin!')
        .setFooter({
            text: `Flipped by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined
        })
        .setTimestamp()

    await interaction.deferReply();
    await flipCoin();

    async function flipCoin() {
        let resettingCollector = false;

        coinEmbed
            .setDescription('Flipping a coin...')
            .setImage('https://i.imgur.com/rLEqeeo.gif')

        const message = await interaction.editReply({
            embeds: [coinEmbed],
            components: [],
        });

        setTimeout(async () => {
            const result = Math.random() > 0.5 ? 'heads' : 'tails';
    
            if (result === 'heads') {
                coinEmbed
                    .setDescription('Heads!')
                    .setImage('https://i.imgur.com/8Me5KsQ.png')
            }
            else {
                coinEmbed
                    .setDescription('Tails!')
                    .setImage('https://i.imgur.com/w6uXDlO.png')
            }
    
            const retryCollector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 30000
            });
    
            retryCollector.on('collect', async (i) => {
                await i.deferUpdate();

                await flipCoin();

                resettingCollector = true;
                retryCollector.stop();
                resettingCollector = false;
            });

            retryCollector.on('end', async () => {
                if (message && !resettingCollector) {
                    await interaction.editReply({
                        components: [],
                    });
                }
            });
            
            await interaction.editReply({
                embeds: [coinEmbed],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retry')
                                .setStyle(ButtonStyle.Danger)
                                .setLabel('Retry'),
                    )
                ],
            });
        }, 3000);
    }
}