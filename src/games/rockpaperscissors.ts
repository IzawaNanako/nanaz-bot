import { EmbedBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User as DiscordUser, ActionRowBuilder, MessageComponentInteraction } from 'discord.js';
import Guild from '../models/guild.js';
import User from '../models/user.js';
import { acceptAndDeclineButton, rematchButton } from '../utils/buttons.js';
import i18next from 'i18next';

const choiceMap: {[key: string]: string} = {
    'rock': '🪨',
    'paper': '📄',
    'scissors': '✂️',
};
const botEmojiMap: { [key: string]: string } = {
    '🪨': '📄',
    '📄': '✂️',
    '✂️': '🪨',
};

i18next.setDefaultNamespace('games');

export async function rockpaperscissors(interaction: ChatInputCommandInteraction, opponent: DiscordUser) {
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
    const rpsTitle = i18next.t('rockpaperscissors:rps_title');
    const hostedByFooter = i18next.t('global:hosted_by_footer');
    const rockButtonLable = i18next.t('rockpaperscissors:rock_button_lable');
    const paperButtonLable = i18next.t('rockpaperscissors:paper_button_lable');
    const scissorsButtonLable = i18next.t('rockpaperscissors:scissors_button_lable');
    const rockVersusRockResult = i18next.t('rockpaperscissors:rock_versus_rock_result');
    const paperVersusPaperResult = i18next.t('rockpaperscissors:paper_versus_paper_result');
    const scissorsVersusScissorsResult = i18next.t('rockpaperscissors:scissors_versus_scissors_result');
    const rockVersusScissorsResult = i18next.t('rockpaperscissors:rock_versus_scissors_result');
    const scissorsVersusPaperResult = i18next.t('rockpaperscissors:scissors_versus_paper_result');
    const paperVersusRockResult = i18next.t('rockpaperscissors:paper_versus_rock_result');

    const leftPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const rightPlayer = leftPlayer === interaction.user ? opponent : interaction.user;

    const chooseMoveMessage = i18next.t('rockpaperscissors:choose_move_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });
    const gameEndInactivityMessage = i18next.t('rockpaperscissors:game_end_inactivity_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(rpsTitle)
        .setDescription(chooseMoveMessage)
        .setImage('https://i.imgur.com/8r6dKEH.png')
        .setFooter({
            text: hostedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp()

    const gameMessage = await interaction.editReply({
        content: '',
        embeds: [gameEmbed],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('rock')
                        .setLabel(rockButtonLable)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel(paperButtonLable)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel(scissorsButtonLable)
                        .setStyle(ButtonStyle.Danger),
                )
        ],
    });

    let userChoice = '';
    let userChoiceEmoji = '';
    let opponentChoice = '';
    let opponentChoiceEmoji = '';
    let userChosen = false;
    let opponentChosen = false;
    let resettingCollector = false;
    let leftPlayerEmoji = '';
    let rightPlayerEmoji = '';

    const choiceCollector = gameMessage.createMessageComponentCollector({
        filter: (i: MessageComponentInteraction) =>
            (i.user === interaction.user && !userChosen) || (i.user === opponent && !opponentChosen),
        time: 30000,
    });

    choiceCollector.on('collect', async (i: MessageComponentInteraction) => {
        i.deferUpdate();
        if ((i.user === interaction.user && opponent !== interaction.user) || (i.user === interaction.user && opponentChosen)) {
            userChoice = i.customId;
            userChoiceEmoji = choiceMap[userChoice];
            userChosen = true;
        }
        else if (i.user === opponent) {
            opponentChoice = i.customId;
            opponentChoiceEmoji = choiceMap[opponentChoice];
            opponentChosen = true;
        }

        if (userChosen && opponentChosen) {
            resettingCollector = true;
            choiceCollector.stop();
            resettingCollector = false;

            leftPlayerEmoji = leftPlayer === interaction.user ? userChoiceEmoji : opponentChoiceEmoji;
            rightPlayerEmoji = leftPlayer === interaction.user ? opponentChoiceEmoji : userChoiceEmoji;

            if (userChoice === opponentChoice) {
                const gameEndDrawMessage = i18next.t('rockpaperscissors:game_end_draw_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_emoji: leftPlayerEmoji,
                    right_player_emoji: rightPlayerEmoji,
                });
                gameEmbed
                    .setDescription(gameEndDrawMessage);
                if (userChoice === 'rock') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: rockVersusRockResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/tGBxsYc.png')
                }
                else if (userChoice === 'paper') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: paperVersusPaperResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/1yzgQ0K.png')
                }
                else {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: scissorsVersusScissorsResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/pD7JrnS.png')
                }
            }
            else if ((userChoice === 'rock' && opponentChoice === 'scissors') || (userChoice === 'scissors' && opponentChoice === 'rock')) {
                const gameEndWinMessage = i18next.t('rockpaperscissors:game_end_win_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_emoji: leftPlayerEmoji,
                    right_player_emoji: rightPlayerEmoji,
                    winner: userChoice === 'rock' ? interaction.user : opponent,
                });
                gameEmbed
                    .setDescription(gameEndWinMessage)
                    .addFields([
                        {
                            name: '\u200b',
                            value: rockVersusScissorsResult,
                        }
                    ])
                    .setImage('https://i.imgur.com/AIF5JpE.png');
            }
            else if ((userChoice === 'scissors' && opponentChoice === 'paper') || (userChoice === 'paper' && opponentChoice === 'scissors')) {
                const gameEndWinMessage = i18next.t('rockpaperscissors:game_end_win_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_emoji: leftPlayerEmoji,
                    right_player_emoji: rightPlayerEmoji,
                    winner: userChoice === 'scissors' ? interaction.user : opponent,
                });
                gameEmbed
                    .setDescription(gameEndWinMessage)
                    .addFields([
                        {
                            name: '\u200b',
                            value: scissorsVersusPaperResult,
                        }
                    ])
                    .setImage('https://i.imgur.com/CUi7LYq.png');
            }
            else if ((userChoice === 'paper' && opponentChoice === 'rock') || (userChoice === 'rock' && opponentChoice === 'paper')) {
                const gameEndWinMessage = i18next.t('rockpaperscissors:game_end_win_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_emoji: leftPlayerEmoji,
                    right_player_emoji: rightPlayerEmoji,
                    winner: userChoice === 'paper' ? interaction.user : opponent,
                });
                gameEmbed
                    .setDescription(gameEndWinMessage)
                    .addFields([
                        {
                            name: '\u200b',
                            value: paperVersusRockResult,
                        }
                    ])
                    .setImage('https://i.imgur.com/fPMYgBK.png');
            }

            await gameMessage.edit({
                embeds: [gameEmbed],
                components: [rematchButton],
            });

            const rematchCollector = gameMessage.createMessageComponentCollector({
                filter: (i: MessageComponentInteraction) => i.user === interaction.user || i.user === opponent,
                time: 30000,
            });

            rematchCollector.on('collect', async (i: MessageComponentInteraction) => {
                i.deferUpdate();
                resettingCollector = true;
                rematchCollector.stop();
                resettingCollector = false;

                if (interaction.user === opponent) {
                    await rockpaperscissors(interaction, interaction.user)
                    return;
                }

                const rematchEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(rpsTitle)
                    .setFooter({
                        text: hostedByFooter,
                        iconURL: interaction.user.avatarURL() ?? undefined,
                    })
                    .setTimestamp();

                const rematchRequester = i.user;
                const rematchAccepter = i.user === interaction.user ? opponent : interaction.user;

                const rematchRequestMessage = i18next.t('global:rematch_request_message', {
                    rematch_requester: rematchRequester,
                });
                const rematchRequestDeclinedMessage = i18next.t('global:rematch_request_declined_message', {
                    rematch_requester: rematchRequester,
                    rematch_accepter: rematchAccepter,
                });
                const rematchRequestIgnoredMessage = i18next.t('global:rematch_request_ignored_message', {
                    rematch_requester: rematchRequester,
                    rematch_accepter: rematchAccepter,
                });

                await gameMessage.edit({
                    content: `${rematchAccepter}`,
                    embeds: [
                        rematchEmbed
                            .setDescription(rematchRequestMessage)
                    ],
                    components: [acceptAndDeclineButton],
                });

                const acceptCollector = gameMessage.createMessageComponentCollector({
                    filter: (i: MessageComponentInteraction) =>
                        i.user === rematchAccepter,
                    time: 30000,
                });

                acceptCollector.on('collect', async (i: MessageComponentInteraction) => {
                    i.deferUpdate();
                    resettingCollector = true;
                    acceptCollector.stop();
                    resettingCollector = false;
                    
                    if (i.customId === 'accept') {
                        await rockpaperscissors(interaction, opponent);
                        return;
                    }
                    else {
                        await gameMessage.edit({
                            content: rematchRequestDeclinedMessage,
                            embeds: [gameEmbed],
                        });
                    }
                });

                acceptCollector.on('end', () => {
                    if (gameMessage && !resettingCollector) {
                        gameMessage.edit({
                            content: rematchRequestIgnoredMessage,
                            embeds: [gameEmbed],
                        });
                    }
                });
            });

            rematchCollector.on('end', () => {
                if (gameMessage && !resettingCollector) {
                    gameMessage.edit({
                        components: [],
                    });
                }
            });
        }
    });

    choiceCollector.on('end', () => {
        if (gameMessage && !resettingCollector) {
            gameEmbed.setDescription(gameEndInactivityMessage);
            gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};

export async function rockpaperscissorsBot(interaction: ChatInputCommandInteraction) {
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
    const rpsTitle = i18next.t('rockpaperscissors:rps_title');
    const hostedByFooter = i18next.t('global:hosted_by_footer');
    const rockButtonLable = i18next.t('rockpaperscissors:rock_button_lable');
    const paperButtonLable = i18next.t('rockpaperscissors:paper_button_lable');
    const scissorsButtonLable = i18next.t('rockpaperscissors:scissors_button_lable');
    const rockVersusRockResult = i18next.t('rockpaperscissors:rock_versus_rock_result');
    const paperVersusPaperResult = i18next.t('rockpaperscissors:paper_versus_paper_result');
    const scissorsVersusScissorsResult = i18next.t('rockpaperscissors:scissors_versus_scissors_result');
    const rockVersusScissorsResult = i18next.t('rockpaperscissors:rock_versus_scissors_result');
    const scissorsVersusPaperResult = i18next.t('rockpaperscissors:scissors_versus_paper_result');
    const paperVersusRockResult = i18next.t('rockpaperscissors:paper_versus_rock_result');

    const leftPlayer = Math.random() < 0.5 ? interaction.user : interaction.client.user;
    const rightPlayer = leftPlayer === interaction.user ? interaction.client.user : interaction.user;

    const chooseMoveMessage = i18next.t('rockpaperscissors:choose_move_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });
    const gameEndInactivityMessage = i18next.t('rockpaperscissors:game_end_inactivity_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(rpsTitle)
        .setDescription(chooseMoveMessage)
        .setImage('https://i.imgur.com/8r6dKEH.png')
        .setFooter({
            text: hostedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp()

    const gameMessage = await interaction.editReply({
        content: '',
        embeds: [gameEmbed],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('rock')
                        .setLabel(rockButtonLable)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel(paperButtonLable)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel(scissorsButtonLable)
                        .setStyle(ButtonStyle.Danger),
                )
        ],
    });

    let userChoice = '';
    let userChoiceEmoji = '';
    let resettingCollector = false;
    let leftPlayerEmoji = '';
    let rightPlayerEmoji = '';

    const choiceCollector = gameMessage.createMessageComponentCollector({
        filter: (i: MessageComponentInteraction) =>
            i.user === interaction.user,
        time: 30000,
    });

    choiceCollector.on('collect', async (i: MessageComponentInteraction) => {
        i.deferUpdate();
        resettingCollector = true;
        choiceCollector.stop();
        resettingCollector = false;

        userChoice = i.customId;
        userChoiceEmoji = choiceMap[userChoice];
        leftPlayerEmoji = leftPlayer === interaction.user ? userChoiceEmoji : botEmojiMap[userChoiceEmoji];
        rightPlayerEmoji = leftPlayer === interaction.user ? botEmojiMap[userChoiceEmoji] : userChoiceEmoji;

        const gameEndDrawMessage = i18next.t('rockpaperscissors:game_end_draw_message', {
            left_player: leftPlayer,
            right_player: rightPlayer,
            left_player_emoji: leftPlayerEmoji,
            right_player_emoji: rightPlayerEmoji,
        });
        const gameEndWinMessage = i18next.t('rockpaperscissors:game_end_win_message', {
            left_player: leftPlayer,
            right_player: rightPlayer,
            left_player_emoji: leftPlayerEmoji,
            right_player_emoji: rightPlayerEmoji,
            winner: leftPlayer === interaction.client.user ? leftPlayer : rightPlayer,
        });

        if (Math.random() < 0.05) {
            gameEmbed
                .setDescription(gameEndDrawMessage)
                if (userChoice === 'rock') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: rockVersusRockResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/tGBxsYc.png')
                }
                else if (userChoice === 'paper') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: paperVersusPaperResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/1yzgQ0K.png')
                }
                else {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: scissorsVersusScissorsResult,
                            }
                        ])
                        .setImage('https://i.imgur.com/pD7JrnS.png')
                }
        }
        else if (userChoice === 'rock') {
            gameEmbed
                .setDescription(gameEndWinMessage)
                .addFields([
                    {
                        name: '\u200b',
                        value: paperVersusRockResult,
                    }
                ])
                .setImage('https://i.imgur.com/fPMYgBK.png');
        }
        else if (userChoice === 'paper') {
            gameEmbed
                .setDescription(gameEndWinMessage)
                .addFields([
                    {
                        name: '\u200b',
                        value: scissorsVersusPaperResult,
                    }
                ])
                .setImage('https://i.imgur.com/CUi7LYq.png');
        }
        else {
            gameEmbed
                .setDescription(gameEndWinMessage)
                .addFields([
                    {
                        name: '\u200b',
                        value: rockVersusScissorsResult,
                    }
                ])
                .setImage('https://i.imgur.com/AIF5JpE.png');
        }

        await gameMessage.edit({
            embeds: [gameEmbed],
            components: [rematchButton],
        });

        const rematchCollector = gameMessage.createMessageComponentCollector({
            filter: (i: MessageComponentInteraction) =>
                i.user === interaction.user,
            time: 30000,
        });

        rematchCollector.on('collect', async (i: MessageComponentInteraction) => {
            i.deferUpdate();
            resettingCollector = true;
            rematchCollector.stop();
            resettingCollector = false;

            await rockpaperscissorsBot(interaction);
            return;
        });

        rematchCollector.on('end', () => {
            if (gameMessage) {
                gameMessage.edit({
                    components: [],
                });
            }
        });
    });

    choiceCollector.on('end', () => {
        if (gameMessage && !resettingCollector) {
            gameEmbed.setDescription(gameEndInactivityMessage);
            gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};