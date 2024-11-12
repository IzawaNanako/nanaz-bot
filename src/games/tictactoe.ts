import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, User as DiscordUser, ButtonInteraction, InteractionCollector, CacheType, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from 'discord.js';
import Guild from '../models/guild.js';
import User from '../models/user.js';
import { acceptAndDeclineButton, rematchButton } from '../utils/buttons.js';
import i18next from 'i18next';

const EMPTY = '\u200b';
const PLAYER_X = '❌';
const PLAYER_O = '⭕';
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

i18next.setDefaultNamespace('games');

export async function tictactoe(interaction: ChatInputCommandInteraction, opponent: DiscordUser) {
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
    const tttTitle = i18next.t('tictactoe:ttt_title');
    const hostedByFooter = i18next.t('global:hosted_by_footer');

    let turn = Math.random() < 0.5 ? PLAYER_X : PLAYER_O;
    let currentPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const leftPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const rightPlayer = leftPlayer === interaction.user ? opponent : interaction.user;
    const leftPlayerSymbol = turn;
    const rightPlayerSymbol = turn === PLAYER_X ? PLAYER_O : PLAYER_X;
    let gameEnded = false;
    let resettingCollector = false;

    let currentTurnMessage = i18next.t('tictactoe:current_turn_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
        current_player: currentPlayer,
    });
    const gameEndDrawMessage = i18next.t('tictactoe:game_end_draw_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
    });
    const gameEndInactivityMessage = i18next.t('tictactoe:game_end_inactivity_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
    });

    const board = Array(9).fill(EMPTY);
    const createBoard = (includeRematchButton = false) => {
        const components = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder<ButtonBuilder>();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(index.toString())
                        .setLabel(board[index])
                        .setStyle(board[index] === EMPTY ? ButtonStyle.Secondary : board[index] === PLAYER_X ? ButtonStyle.Primary : ButtonStyle.Success)
                        .setDisabled(board[index] !== EMPTY || gameEnded)
                );
            }
            components.push(row);
        }
        if (includeRematchButton) {
            components.push(rematchButton);
        }
        return components;
    };

    const checkWin = (symbol: string) => {
        return winningCombos.some(combo => combo.every(index => board[index] === symbol));
    };

    const gameMessage = await interaction.editReply({
        content: currentTurnMessage,
        embeds: [],
        components: createBoard(),
    });

    let moveCollector: InteractionCollector<StringSelectMenuInteraction<CacheType> | UserSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType> | MentionableSelectMenuInteraction<CacheType> | ChannelSelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>>;;

    const startCollector = () => {
        moveCollector = gameMessage.createMessageComponentCollector({
            filter: (i: MessageComponentInteraction) => 
                i.user === currentPlayer,
            time: 30000,
        });

        moveCollector.on('collect', async (i: MessageComponentInteraction) => {
            i.deferUpdate();
            const index = parseInt(i.customId);
            if (!board.includes(EMPTY) || gameEnded) {
                return;
            }

            board[index] = turn;

            if (checkWin(turn)) {
                gameEnded = true;
                moveCollector.stop();

                const gameEndWinMessage = i18next.t('tictactoe:game_end_win_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_symbol: leftPlayerSymbol,
                    right_player_symbol: rightPlayerSymbol,
                    winner: currentPlayer,
                });

                await gameMessage.edit({
                    content: gameEndWinMessage,
                    components: createBoard(true),
                });
            }
            else if (!board.includes(EMPTY)) {
                gameEnded = true;
                await gameMessage.edit({
                    content: gameEndDrawMessage,
                    components: createBoard(true),
                });
            }

            if (gameEnded) {
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
                        await tictactoe(interaction, interaction.user);
                        return;
                    }
    
                    const rematchEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(tttTitle)
                        .setFooter({
                            text: hostedByFooter,
                            iconURL: interaction.user.avatarURL() ?? undefined,
                        })
                        .setTimestamp();
                    
                    const gameEndResultContent = gameMessage.content;
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
                            await tictactoe(interaction, opponent);
                            return;
                        }
                        else {
                            await gameMessage.edit({
                                content: `${gameEndResultContent}\n\n${rematchRequestDeclinedMessage}`,
                                embeds: [],
                                components: createBoard(),
                            });
                        }
                    });
    
                    acceptCollector.on('end', () => {
                        if (gameMessage && !resettingCollector) {
                            gameMessage.edit({
                                content: `${gameEndResultContent}\n\n${rematchRequestIgnoredMessage}`,
                                embeds: [],
                                components: createBoard(),
                            });
                        }
                    });
                });
    
                rematchCollector.on('end', () => {
                    if (gameMessage && !resettingCollector) {
                        gameMessage.edit({
                            components: createBoard(),
                        });
                    }
                });
            }
            else {
                turn = turn === PLAYER_X ? PLAYER_O : PLAYER_X;
                currentPlayer = currentPlayer === interaction.user ? opponent : interaction.user;

                currentTurnMessage = i18next.t('tictactoe:current_turn_message', {
                    left_player: leftPlayer,
                    right_player: rightPlayer,
                    left_player_symbol: leftPlayerSymbol,
                    right_player_symbol: rightPlayerSymbol,
                    current_player: currentPlayer,
                });

                await gameMessage.edit({
                    content: currentTurnMessage,
                    components: createBoard(),
                });

                resettingCollector = true;
                moveCollector.stop();
                resettingCollector = false;
                startCollector();
            }
        });

        moveCollector.on('end', async () => {
            if (gameMessage && !gameEnded && !resettingCollector) {
                gameEnded = true;
                await gameMessage.edit({
                    content: gameEndInactivityMessage,
                    components: createBoard(),
                });
            }
        });
    };

    startCollector();
};

export async function tictactoeBot(interaction: ChatInputCommandInteraction) {
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

    let currentPlayer = Math.random() < 0.5 ? interaction.user : interaction.client.user;
    const leftPlayer = currentPlayer;
    const rightPlayer = currentPlayer === interaction.user ? interaction.client.user : interaction.user;
    const leftPlayerSymbol = Math.random() < 0.5 ? PLAYER_X : PLAYER_O;
    const rightPlayerSymbol = leftPlayerSymbol === PLAYER_X ? PLAYER_O : PLAYER_X;
    const botSymbol = currentPlayer === interaction.user ? rightPlayerSymbol : leftPlayerSymbol;
    const playerSymbol = botSymbol === leftPlayerSymbol ? rightPlayerSymbol : leftPlayerSymbol;
    let gameEnded = false;
    let resettingCollector = false;

    let currentTurnMessage = i18next.t('tictactoe:current_turn_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
        current_player: currentPlayer,
    });
    const gameEndDrawMessage = i18next.t('tictactoe:game_end_draw_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
    });
    const gameEndInactivityMessage = i18next.t('tictactoe:game_end_inactivity_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
    });
    const gameEndBotWinMessage = i18next.t('tictactoe:game_end_bot_win_message', {
        left_player: leftPlayer,
        right_player: rightPlayer,
        left_player_symbol: leftPlayerSymbol,
        right_player_symbol: rightPlayerSymbol,
    });

    const board = new Array(9).fill(EMPTY);
    const createBoard = (includeRematchButton = false) => {
        const components = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder<ButtonBuilder>();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(index.toString())
                        .setLabel(board[index])
                        .setStyle(board[index] === EMPTY ? ButtonStyle.Secondary : board[index] === PLAYER_X ? ButtonStyle.Primary : ButtonStyle.Success)
                        .setDisabled(board[index] !== EMPTY || gameEnded)
                );
            }
            components.push(row);
        }
        if (includeRematchButton) {
            components.push(rematchButton);
        }
        return components;
    };

    const gameMessage = await interaction.editReply({
        content: currentTurnMessage,
        components: createBoard(),
    });

    let moveCollector: InteractionCollector<StringSelectMenuInteraction<CacheType> | UserSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType> | MentionableSelectMenuInteraction<CacheType> | ChannelSelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>>;

    const checkWin = (symbol: string) => {
        return winningCombos.some(combo => combo.every(index => board[index] === symbol));
    };

    const botMove = () => {
        function minimax(newBoard: string[], isMaximizing: boolean): number {
            if (checkWin(botSymbol)) {
                return 1;
            }
            if (checkWin(playerSymbol)) {
                return -1;
            }
            if (!newBoard.includes(EMPTY)) {
                return 0;
            }

            const availableSpots = newBoard.map((spot, index) => spot === EMPTY ? index : null).filter(index => index !== null) as number[];

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (const spot of availableSpots) {
                    newBoard[spot] = botSymbol;
                    const score = minimax(newBoard, false);
                    newBoard[spot] = EMPTY;
                    bestScore = Math.max(score, bestScore);
                    if (bestScore === 1) {
                        break;
                    }
                }
                return bestScore;
            }
            else {
                let bestScore = Infinity;
                for (const spot of availableSpots) {
                    newBoard[spot] = playerSymbol;
                    const score = minimax(newBoard, true);
                    newBoard[spot] = EMPTY;
                    bestScore = Math.min(score, bestScore);
                    if (bestScore === -1) {
                        break;
                    }
                }
                return bestScore;
            }
        }

        let bestScore = -Infinity;
        let bestMove = -1;
        for (const spot of board.map((spot, index) => spot === EMPTY ? index : null).filter(index => index !== null) as number[]) {
            board[spot] = botSymbol;
            const score = minimax(board, false);
            board[spot] = EMPTY;
            if (score > bestScore) {
                bestScore = score;
                bestMove = spot;
            }
        }
        return bestMove;
    }

    function switchTurn() {
        currentPlayer = currentPlayer === interaction.user ? interaction.client.user : interaction.user;
        
        currentTurnMessage = i18next.t('tictactoe:current_turn_message', {
            left_player: leftPlayer,
            right_player: rightPlayer,
            left_player_symbol: leftPlayerSymbol,
            right_player_symbol: rightPlayerSymbol,
            current_player: currentPlayer,
        });

        gameMessage.edit({
            content: currentTurnMessage,
            components: createBoard(),
        });
    }

    function startCollector() {
        moveCollector = gameMessage.createMessageComponentCollector({
            filter: (i: MessageComponentInteraction) => 
                i.user === interaction.user,
            time: 30000,
        });

        moveCollector.on('collect', async (i: MessageComponentInteraction) => {
            i.deferUpdate();
            resettingCollector = true;
            moveCollector.stop();
            resettingCollector = false;

            const index = parseInt(i.customId);
            board[index] = playerSymbol;

            if (!board.includes(EMPTY)) {
                gameEnded = true;
                await gameMessage.edit({
                    content: gameEndDrawMessage,
                    components: createBoard(true),
                });
            }

            if (gameEnded) {
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
        
                    await tictactoeBot(interaction);
                });
        
                rematchCollector.on('end', () => {
                    if (gameMessage) {
                        gameMessage.edit({
                            components: createBoard(),
                        });
                    }
                });
            }
            else {
                switchTurn();
                startBotMove();
            }
        });

        moveCollector.on('end', () => {
            if (gameMessage && !gameEnded && !resettingCollector) {
                gameEnded = true;
                gameMessage.edit({
                    content: gameEndInactivityMessage,
                    components: createBoard(),
                });
            }
        });
    }

    function startBotMove() {
        board[botMove()] = botSymbol;

        if (checkWin(botSymbol)) {
            gameEnded = true;
            gameMessage.edit({
                content: gameEndBotWinMessage,
                components: createBoard(true),
            });
        }
        else if (!board.includes(EMPTY)) {
            gameEnded = true;
            gameMessage.edit({
                content: gameEndDrawMessage,
                components: createBoard(true),
            });
        }

        if (gameEnded) {
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
    
                await tictactoeBot(interaction);
                return;
            });
    
            rematchCollector.on('end', () => {
                if (gameMessage) {
                    gameMessage.edit({
                        components: createBoard(),
                    });
                }
            });
        }
        else {
            setTimeout(() => {
                switchTurn();
                startCollector();
            }, 1500);
        }
    }

    if (currentPlayer === interaction.client.user) {
        const edges = [1, 3, 5, 7];
        const corners = [0, 2, 6, 8];
        const firstMove = Math.random();

        if (firstMove < 0.15) {
            board[edges[Math.floor(Math.random() * edges.length)]] = botSymbol;
        }
        else if (firstMove < 0.75) {
            board[corners[Math.floor(Math.random() * corners.length)]] = botSymbol;
        }
        else {
            board[4] = botSymbol;
        }

        setTimeout(() => {
            switchTurn();
            startCollector();
        }, 500);
    }
    else {
        startCollector();
    }
};