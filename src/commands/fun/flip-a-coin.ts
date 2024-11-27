import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import i18next from 'i18next';

i18next.setDefaultNamespace('commands');

export const data = new SlashCommandBuilder()
    .setName('flip-a-coin')
    .setDescription('Flip a coin!')
    .setDescriptionLocalizations({
        'en-US': 'Flip a coin!',
        'ja': 'コインを裏返す！',
        'zh-CN': '掷硬币！',
        'zh-TW': '擲硬幣！',
    });
export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        await i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        if (executeUser) {
            await i18next.changeLanguage(executeUser.language);
        }
        else {
            await i18next.changeLanguage(interaction.locale);
        }
    }
    
    const requestedByAuthor = i18next.t('global.requestedByAuthor', {
        userDisplayName: interaction.user.displayName,
    });
    const coinEmbedTitle = i18next.t('flipACoin.coinEmbedTitle');
    const coinEmbedFooter = i18next.t('flipACoin.coinEmbedFooter');
    const flippingCoinMessage = i18next.t('flipACoin.flippingCoinMessage');
    const headsMessage = i18next.t('flipACoin.headsMessage');
    const tailsMessage = i18next.t('flipACoin.tailsMessage');
    const retryLiteral = i18next.t('flipACoin.retryLiteral');

    const coinEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(coinEmbedTitle)
        .setFooter({
            text: coinEmbedFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined
        })
        .setTimestamp()

    async function flipCoin() {
        let resettingCollector = false;

        coinEmbed
            .setDescription(flippingCoinMessage)
            .setImage('https://i.imgur.com/rLEqeeo.gif')

        const message = await interaction.editReply({
            embeds: [coinEmbed],
            components: [],
        });

        setTimeout(async () => {
            const result = Math.random() > 0.5 ? 'heads' : 'tails';
    
            if (result === 'heads') {
                coinEmbed
                    .setDescription(headsMessage)
                    .setImage('https://i.imgur.com/8Me5KsQ.png')
            }
            else {
                coinEmbed
                    .setDescription(tailsMessage)
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
                                .setLabel(retryLiteral),
                    )
                ],
            });
        }, 3000);
    }

    await flipCoin();
}