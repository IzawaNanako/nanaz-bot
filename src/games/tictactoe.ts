import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, User as DiscordUser, ButtonInteraction, InteractionCollector, CacheType, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from 'discord.js';
import { setInteractionLanguage } from '../utils/setInteractionLanguage.js';
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

/**
 * Play a game of tic-tac-toe with another human user.
 * @param interaction The interaction that triggered the command.
 * @param opponent The opponent of the user that triggered the command.
 */
export async function tictactoe(interaction: ChatInputCommandInteraction, opponent: DiscordUser) {
    i18next.setDefaultNamespace('games');

    await setInteractionLanguage(interaction);

    const tttTitle = i18next.t('ticTacToe.tttTitle');
    const hostedByFooter = i18next.t('global.hostedByFooter');

    let turn = Math.random() < 0.5 ? PLAYER_X : PLAYER_O;
    let currentPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const leftPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const rightPlayer = leftPlayer === interaction.user ? opponent : interaction.user;
    const leftPlayerSymbol = turn;
    const rightPlayerSymbol = turn === PLAYER_X ? PLAYER_O : PLAYER_X;
    let gameEnded = false;
    let resettingCollector = false;

    let currentTurnMessage = i18next.t('ticTacToe.currentTurnMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
        currentPlayer: currentPlayer.id,
    });
    const gameEndDrawMessage = i18next.t('ticTacToe.gameEndDrawMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
    });
    const gameEndInactivityMessage = i18next.t('ticTacToe.gameEndInactivityMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
    });

    const board = Array(9).fill(EMPTY);
    /**
     * Generates the board components based on the current state of the game.
     * @param includeRematchButton Whether to include the rematch button, use when the game is over. Default is false.
     * @returns Returns the board components.
     */
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

    /**
     * Checks if the given symbol has won the game.
     * @param symbol The symbol to check for a win.
     * @returns Returns true if the symbol has won the game, otherwise returns false.
     */
    const checkWin = (symbol: string) => {
        return winningCombos.some(combo => combo.every(index => board[index] === symbol));
    };

    const gameMessage = await interaction.editReply({
        content: currentTurnMessage,
        embeds: [],
        components: createBoard(),
    });

    let moveCollector: InteractionCollector<StringSelectMenuInteraction<CacheType> | UserSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType> | MentionableSelectMenuInteraction<CacheType> | ChannelSelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>>;

    /**
     * Starts the move collector.
     */
    async function startCollector() {
        moveCollector = gameMessage.createMessageComponentCollector({
            filter: (buttonInteraction: MessageComponentInteraction) => (
                buttonInteraction.user === currentPlayer
            ),
            time: 30000,
        });

        moveCollector.on('collect', async (buttonInteraction: MessageComponentInteraction) => {
            await buttonInteraction.deferUpdate();

            const index = parseInt(buttonInteraction.customId);
            if (!board.includes(EMPTY) || gameEnded) {
                return;
            }

            board[index] = turn;

            if (checkWin(turn)) {
                gameEnded = true;
                moveCollector.stop();

                const gameEndWinMessage = i18next.t('ticTacToe.gameEndWinMessage', {
                    ns: 'games',
                    leftPlayer: leftPlayer.id,
                    rightPlayer: rightPlayer.id,
                    leftPlayerSymbol: leftPlayerSymbol,
                    rightPlayerSymbol: rightPlayerSymbol,
                    winner: currentPlayer.id,
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
                    filter: (buttonInteraction: MessageComponentInteraction) => (
                        buttonInteraction.user === interaction.user || buttonInteraction.user === opponent
                    ),
                    time: 30000,
                });
    
                rematchCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
                    await buttonInteraction.deferUpdate();
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
                    const rematchRequester = buttonInteraction.user;
                    const rematchAccepter = buttonInteraction.user === interaction.user ? opponent : interaction.user;

                    const rematchRequestMessage = i18next.t('global.rematchRequestMessage', {
                        ns: 'games',
                        rematchRequester: rematchRequester.id,
                    });
                    const rematchRequestDeclinedMessage = i18next.t('global.rematchRequestDeclinedMessage', {
                        ns: 'games',
                        rematchRequester: rematchRequester.id,
                        rematchAccepter: rematchAccepter.id,
                    });
                    const rematchRequestIgnoredMessage = i18next.t('global.rematchRequestIgnoredMessage', {
                        ns: 'games',
                        rematchRequester: rematchRequester.id,
                        rematchAccepter: rematchAccepter.id,
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
                        filter: (buttonInteraction: MessageComponentInteraction) => (
                            buttonInteraction.user === rematchAccepter
                        ),
                        time: 30000,
                    });
    
                    acceptCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
                        await buttonInteraction.deferUpdate();
                        resettingCollector = true;
                        acceptCollector.stop();
                        resettingCollector = false;
                        
                        if (buttonInteraction.customId === 'accept') {
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
    
                    acceptCollector.on('end', async () => {
                        if (gameMessage && !resettingCollector) {
                            await gameMessage.edit({
                                content: `${gameEndResultContent}\n\n${rematchRequestIgnoredMessage}`,
                                embeds: [],
                                components: createBoard(),
                            });
                        }
                    });
                });
    
                rematchCollector.on('end', async () => {
                    if (gameMessage && !resettingCollector) {
                        await gameMessage.edit({
                            components: createBoard(),
                        });
                    }
                });
            }
            else {
                turn = turn === PLAYER_X ? PLAYER_O : PLAYER_X;
                currentPlayer = currentPlayer === interaction.user ? opponent : interaction.user;

                currentTurnMessage = i18next.t('ticTacToe.currentTurnMessage', {
                    ns: 'games',
                    leftPlayer: leftPlayer.id,
                    rightPlayer: rightPlayer.id,
                    leftPlayerSymbol: leftPlayerSymbol,
                    rightPlayerSymbol: rightPlayerSymbol,
                    currentPlayer: currentPlayer.id,
                });

                await gameMessage.edit({
                    content: currentTurnMessage,
                    components: createBoard(),
                });

                resettingCollector = true;
                moveCollector.stop();
                resettingCollector = false;
                await startCollector();
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

/**
 * Play a game of tic-tac-toe against the bot.
 * @param interaction The interaction that triggered the command.
 */
export async function tictactoeBot(interaction: ChatInputCommandInteraction) {
    i18next.setDefaultNamespace('games');

    await setInteractionLanguage(interaction);

    let currentPlayer = Math.random() < 0.5 ? interaction.user : interaction.client.user;
    const leftPlayer = currentPlayer;
    const rightPlayer = currentPlayer === interaction.user ? interaction.client.user : interaction.user;
    const leftPlayerSymbol = Math.random() < 0.5 ? PLAYER_X : PLAYER_O;
    const rightPlayerSymbol = leftPlayerSymbol === PLAYER_X ? PLAYER_O : PLAYER_X;
    const botSymbol = currentPlayer === interaction.user ? rightPlayerSymbol : leftPlayerSymbol;
    const playerSymbol = botSymbol === leftPlayerSymbol ? rightPlayerSymbol : leftPlayerSymbol;
    let gameEnded = false;
    let resettingCollector = false;

    let currentTurnMessage = i18next.t('ticTacToe.currentTurnMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
        currentPlayer: currentPlayer.id,
    });
    const gameEndDrawMessage = i18next.t('ticTacToe.gameEndDrawMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
    });
    const gameEndInactivityMessage = i18next.t('ticTacToe.gameEndInactivityMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
    });
    const gameEndBotWinMessage = i18next.t('ticTacToe.gameEndBotWinMessage', {
        leftPlayer: leftPlayer.id,
        rightPlayer: rightPlayer.id,
        leftPlayerSymbol: leftPlayerSymbol,
        rightPlayerSymbol: rightPlayerSymbol,
    });

    const board = new Array(9).fill(EMPTY);
    /**
     * Generates the board components based on the current state of the game.
     * @param includeRematchButton Whether to include the rematch button, use when the game is over. Default is false.
     * @returns Returns the board components.
     */
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

    /**
     * Checks if the given symbol has won the game.
     * @param symbol The symbol to check for a win.
     * @returns Returns true if the symbol has won the game, otherwise returns false.
     */
    const checkWin = (symbol: string) => {
        return winningCombos.some(combo => combo.every(index => board[index] === symbol));
    };

    /**
     * Gets the best move for the bot.
     * @returns The index number of the chosen spot.
     */
    const botMove = () => {
        /**
         * The minimax algorithm, used to get the best move.
         * @param newBoard What the board looks like currently.
         * @param isMaximizing Whether the bot is maximizing or minimizing score.
         * @returns 
         */
        const minimax = (newBoard: string[], isMaximizing: boolean) => {
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
                // Maximizing the score of the bot.
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
                // Minimizing the score of the user.
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

    /**
     * Switches the turn to the other player.
     */
    async function switchTurn() {
        currentPlayer = currentPlayer === interaction.user ? interaction.client.user : interaction.user;
        
        currentTurnMessage = i18next.t('ticTacToe.currentTurnMessage', {
            ns: 'games',
            leftPlayer: leftPlayer.id,
            rightPlayer: rightPlayer.id,
            leftPlayerSymbol: leftPlayerSymbol,
            rightPlayerSymbol: rightPlayerSymbol,
            currentPlayer: currentPlayer.id,
        });

        await gameMessage.edit({
            content: currentTurnMessage,
            components: createBoard(),
        });
    }

    /**
     * Starts the move collector for the user.
     */
    async function startCollector() {
        moveCollector = gameMessage.createMessageComponentCollector({
            filter: (buttonInteraction: MessageComponentInteraction) => (
                buttonInteraction.user === interaction.user
            ),
            time: 30000,
        });

        moveCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            await buttonInteraction.deferUpdate();
            resettingCollector = true;
            moveCollector.stop();
            resettingCollector = false;

            const index = parseInt(buttonInteraction.customId);
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
                    filter: (buttonInteraction: MessageComponentInteraction) => (
                        buttonInteraction.user === interaction.user
                    ),
                    time: 30000,
                });
        
                rematchCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
                    await buttonInteraction.deferUpdate();
                    resettingCollector = true;
                    rematchCollector.stop();
                    resettingCollector = false;
        
                    await tictactoeBot(interaction);
                });
        
                rematchCollector.on('end', async () => {
                    if (gameMessage) {
                        await gameMessage.edit({
                            components: createBoard(),
                        });
                    }
                });
            }
            else {
                await switchTurn();
                await startBotMove();
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
    }

    /**
     * Switches the turn to the bot, then makes a move for the bot.
     */
    async function startBotMove() {
        board[botMove()] = botSymbol;

        if (checkWin(botSymbol)) {
            gameEnded = true;
            await gameMessage.edit({
                content: gameEndBotWinMessage,
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
                filter: (buttonInteraction: MessageComponentInteraction) => (
                    buttonInteraction.user === interaction.user
                ),
                time: 30000,
            });
    
            rematchCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
                await buttonInteraction.deferUpdate();
                resettingCollector = true;
                rematchCollector.stop();
                resettingCollector = false;
    
                await tictactoeBot(interaction);
                return;
            });
    
            rematchCollector.on('end', async () => {
                if (gameMessage) {
                    await gameMessage.edit({
                        components: createBoard(),
                    });
                }
            });
        }
        else {
            setTimeout(async () => {
                await switchTurn();
                await startCollector();
            }, 1500);
        }
    }

    if (currentPlayer === interaction.client.user) {
        const edges = [1, 3, 5, 7];
        const corners = [0, 2, 6, 8];
        const firstMove = Math.random();

        // The bot has a set chance to choose a spot for the first move. 3.75% for each edge, 15% for each corner, and 25% for the center.
        if (firstMove < 0.15) {
            board[edges[Math.floor(Math.random() * edges.length)]] = botSymbol;
        }
        else if (firstMove < 0.75) {
            board[corners[Math.floor(Math.random() * corners.length)]] = botSymbol;
        }
        else {
            board[4] = botSymbol;
        }

        setTimeout(async () => {
            await switchTurn();
            await startCollector();
        }, 1000);
    }
    else {
        await startCollector();
    }
};
