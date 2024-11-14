import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, TextChannel, MessageComponentInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { acceptAndDeclineButton } from '../../utils/buttons.js';
import { tictactoe, tictactoeBot } from '../../games/tictactoe.js';
import { rockpaperscissors, rockpaperscissorsBot } from '../../games/rockpaperscissors.js';
import i18next from 'i18next';

const gameMap: { [key: string]: string } = {
    'ttt': 'Tic Tac Toe',
    'rps': 'Rock Paper Scissors',
};

i18next.setDefaultNamespace('commands');

export const data = new SlashCommandBuilder()
    .setName('challenge')
    .setDescription('Challenge someone to a game!')
    .setDescriptionLocalizations({
        'en-US': 'Challenge someone to a game!',
        'ja': '誰かに勝負を挑む！',
        'zh-CN': '挑战某人来一场比赛！',
        'zh-TW': '挑戰某人來一場比賽！',
    })
    .addStringOption(option => option
        .setName('game')
        .setDescription('The game you want to play.')
        .setDescriptionLocalizations({
            'en-US': 'The game you want to play.',
            'ja': 'あなたがプレーしたい試合。',
            'zh-CN': '您想玩的游戏。',
            'zh-TW': '您想玩的遊戲。',
        })
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
        .setDescriptionLocalizations({
            'en-US': 'The user you want to challenge. You can also challenge me!',
            'ja': '挑戦したいユーザー。私に挑戦することもできます！',
            'zh-CN': '您要挑战的用户。 您也可以挑战我！',
            'zh-TW': '您要挑戰的使用者。 您也可以挑戰我！',
        })
        .setRequired(true)
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        i18next.changeLanguage(executeUser?.language);
    }
    const notTextChannelError = i18next.t('challenge.notTextChannelError');
    const invalidGameError = i18next.t('challenge.invalidGameError');
    const invalidUserError = i18next.t('global.invalidUserError');
    const challengeOtherBotError = i18next.t('challenge.challengeOtherBotError');
    try {
        if (interaction.channel instanceof TextChannel === false) {
            await interaction.reply({
                content: notTextChannelError,
                ephemeral: true,
            });
            return;
        }
        const game = interaction.options.get('game', true).value as string;
        if (!game) {
            await interaction.reply({
                content: invalidGameError,
                ephemeral: true,
            });
            return;
        }
        const opponent = interaction.options.get('user', true).user;
        if (!opponent) {
            await interaction.reply({
                content: invalidUserError,
                ephemeral: true,
            });
            return;
        }
        else if (opponent.bot && opponent !== interaction.client.user) {
            await interaction.reply({
                content: challengeOtherBotError,
                ephemeral: true,
            });
            return;
        }

        const challengeLetterLiteral = i18next.t('challenge.challengeLetterLiteral');
        const challengeLetterMessage = i18next.t('challenge.challengeLetterMessage', {
            challenger: interaction.user,
            game: gameMap[game],
        });
        const deliveredByFooter = i18next.t('challenge.deliveredByFooter');
        const challengeDeclinedMessage = i18next.t('challenge.challengeDeclinedMessage', {
            challenger: interaction.user,
            challenged: opponent,
        });
        const challengeNotRespondedMessage = i18next.t('challenge.challengeNotRespondedMessage', {
            challenged: opponent,
        });
        const challengeThemselvesMessage = i18next.t('challenge.challengeThemselvesMessage');
        const challengeCurrentBotMessage = i18next.t('challenge.challengeCurrentBotMessage');

        if (opponent !== interaction.client.user && opponent !== interaction.user) {
            const letterEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(challengeLetterLiteral)
                .setDescription(challengeLetterMessage)
                .setFooter({
                    text: deliveredByFooter,
                    iconURL: interaction.client.user.avatarURL() ?? undefined
                })
                .setTimestamp();
            const challengeLetter = await interaction.reply({
                content: `${opponent}`,
                embeds: [letterEmbed],
                components: [acceptAndDeclineButton],
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
                    letterEmbed
                        .setDescription(challengeDeclinedMessage);
                    challengeLetter.edit({
                        content: '',
                        embeds: [letterEmbed],
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
                    letterEmbed
                        .setDescription(challengeNotRespondedMessage);
                    challengeLetter.edit({
                        content: '',
                        embeds: [letterEmbed],
                        components: [],
                    });
                    return;
                }
            });
        }
        else if (opponent === interaction.user) {
            await interaction.reply({
                content: challengeThemselvesMessage,
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
            await interaction.reply({
                content: challengeCurrentBotMessage,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        if (error.code === 10008) {
            return;
        }
        console.error(error);
        return;
    }
}