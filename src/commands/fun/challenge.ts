import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, MessageComponentInteraction } from 'discord.js';
import { tictactoe, tictactoeBot } from '../../games/tictactoe.js';
import { rockpaperscissors, rockpaperscissorsBot } from '../../games/rockpaperscissors.js';

export const data = new SlashCommandBuilder()
    .setName('challenge')
    .setDescription('Challenge someone to a game!')
    .addStringOption(option => option
        .setName('game')
        .setDescription('The game you want to play.')
        .addChoices(
            {
                name: 'tic-tac-toe',
                value: 'ttt',
            },
            {
                name: 'rock-paper-scissors',
                value: 'rps',
            }
        )
        .setRequired(true)
    )
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user you want to challenge. You can also challenge me!')
        .setRequired(true)
    );
export async function execute(interaction: CommandInteraction) {
    try {
        const gameMap: { [key: string]: string } = {
            'ttt': 'Tic Tac Toe',
            'rps': 'Rock Paper Scissors',
        };
        if (interaction.channel instanceof TextChannel === false) {
            await interaction.reply({
                content: 'This command can only be used in a text channel.',
                ephemeral: true,
            });
            return;
        }
        const game = interaction.options.get('game', true).value as string;
        if (!game) {
            await interaction.reply({
                content: 'Invalid Game.',
                ephemeral: true,
            });
            return;
        }
        const opponent = interaction.options.get('user', true).user;
        if (!opponent) {
            await interaction.reply({
                content: 'Invalid User.',
                ephemeral: true,
            });
            return;
        }
        else if (opponent.bot && opponent !== interaction.client.user) {
            await interaction.reply({
                content: 'You cannot challenge other bots except me!',
                ephemeral: true,
            });
            return;
        }

        if (opponent !== interaction.client.user && opponent !== interaction.user) {
            const challengeLetter = await interaction.reply({
                content: `${opponent}`,
                embeds: [
                    new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('Challenge Letter')
                        .setDescription(`You have been challenged by ${interaction.user} into a game of ${gameMap[game]}! Do you accept the challenge?`)
                        .setFooter({
                            text: `Delivered by Nanaz`,
                            iconURL: interaction.client.user.avatarURL() ?? undefined
                        })
                        .setTimestamp(),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('decline')
                                .setLabel('Decline')
                                .setStyle(ButtonStyle.Danger)
                    )
                ],
            });
            const acceptCollector = challengeLetter.createMessageComponentCollector({
                filter: i => i.user.id === opponent.id,
                max: 1,
                time: 60000,
            });
            let received = false;

            acceptCollector.on('collect', async (i: MessageComponentInteraction) => {
                received = true;
                acceptCollector.stop();
                if (i.customId === 'decline') {
                    challengeLetter.edit({
                        content: '',
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#5865F2')
                                .setTitle('Challenge Letter')
                                .setDescription(`${opponent} has declined ${interaction.user}'s challenge. :(`),
                        ],
                        components: [],
                    });
                    return;
                }
                else {
                    if (game === 'ttt') {
                        tictactoe(interaction, opponent);
                    }
                    else if (game === 'rps') {
                        rockpaperscissors(interaction, opponent);
                    }
                }
            });
            acceptCollector.on('end', async () => {
                if (!received) {
                    challengeLetter.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#5865F2')
                                .setTitle('Challenge Letter')
                                .setDescription(`${opponent} didn't respond to the challenge...`),
                        ]
                    });
                    return;
                }
            });
        }
        else if (opponent === interaction.user) {
            interaction.reply({
                content: 'Why would you challenge yourself? You\'re weird, but I\'ll let you do it anyway.',
            });
            setTimeout(() => {
                if (game === 'ttt') {
                    tictactoe(interaction, opponent);
                }
                else if (game === 'rps') {
                    rockpaperscissors(interaction, opponent);
                }
            }, 2000);
        }
        else {
            interaction.reply({
                content: 'Challenging me? It\'s impossible to win, but you can try to not lose!',
            });
            setTimeout(() => {
                if (game === 'ttt') {
                    tictactoeBot(interaction);
                }
                else if (game === 'rps') {
                    rockpaperscissorsBot(interaction);
                }
            }, 2000);
        }
    }
    catch (error: any) {
        if (error.code === 10008) {
            return;
        }
        console.error(error);
        return;
    }
}