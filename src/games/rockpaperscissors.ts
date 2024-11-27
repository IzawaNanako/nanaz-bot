import { EmbedBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User as DiscordUser, ActionRowBuilder, MessageComponentInteraction } from 'discord.js';
import Guild from '../models/guild.js';
import User from '../models/user.js';
import { acceptAndDeclineButton, rematchButton } from '../utils/buttons.js';
import i18next from 'i18next';

const choiceMap: Record<string, string> = {
    'rock': '🪨',
    'paper': '📄',
    'scissors': '✂️',
};
const botEmojiMap: Record<string, string> = {
    '🪨': '📄',
    '📄': '✂️',
    '✂️': '🪨',
};

export async function rockpaperscissors(interaction: ChatInputCommandInteraction, opponent: DiscordUser) {
    i18next.setDefaultNamespace('games');
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

    const rpsTitle = i18next.t('rockPaperScissors.rpsTitle');
    const hostedByFooter = i18next.t('global.hostedByFooter');
    const rockButtonLabel = i18next.t('rockPaperScissors.rockButtonLabel');
    const paperButtonLabel = i18next.t('rockPaperScissors.paperButtonLabel');
    const scissorsButtonLabel = i18next.t('rockPaperScissors.scissorsButtonLabel');
    const rockVersusRockResult = i18next.t('rockPaperScissors.rockVersusRockResult');
    const paperVersusPaperResult = i18next.t('rockPaperScissors.paperVersusPaperResult');
    const scissorsVersusScissorsResult = i18next.t('rockPaperScissors.scissorsVersusScissorsResult');
    const rockVersusScissorsResult = i18next.t('rockPaperScissors.rockVersusScissorsResult');
    const scissorsVersusPaperResult = i18next.t('rockPaperScissors.scissorsVersusPaperResult');
    const paperVersusRockResult = i18next.t('rockPaperScissors.paperVersusRockResult');

    const leftPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const rightPlayer = leftPlayer === interaction.user ? opponent : interaction.user;

    const chooseChoiceMessage = i18next.t('rockPaperScissors.chooseChoiceMessage', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });
    const gameEndInactivityMessage = i18next.t('rockPaperScissors.gameEndInactivityMessage', {
        left_player: leftPlayer,
        right_player: rightPlayer,
    });

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(rpsTitle)
        .setDescription(chooseChoiceMessage)
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
                        .setLabel(rockButtonLabel)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel(paperButtonLabel)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel(scissorsButtonLabel)
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
        await i.deferUpdate();
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
                const gameEndDrawMessage = i18next.t('rockPaperScissors.gameEndDrawMessage', {
                    leftPlayer: leftPlayer,
                    rightPlayer: rightPlayer,
                    leftPlayerEmoji: leftPlayerEmoji,
                    rightPlayerEmoji: rightPlayerEmoji,
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
                const gameEndWinMessage = i18next.t('rockPaperScissors.gameEndWinMessage', {
                    leftPlayer: leftPlayer,
                    rightPlayer: rightPlayer,
                    leftPlayerEmoji: leftPlayerEmoji,
                    rightPlayerEmoji: rightPlayerEmoji,
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
                const gameEndWinMessage = i18next.t('rockPaperScissors.gameEndWinMessage', {
                    leftPlayer: leftPlayer,
                    rightPlayer: rightPlayer,
                    leftPlayerEmoji: leftPlayerEmoji,
                    rightPlayerEmoji: rightPlayerEmoji,
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
                const gameEndWinMessage = i18next.t('rockPaperScissors.gameEndWinMessage', {
                    leftPlayer: leftPlayer,
                    rightPlayer: rightPlayer,
                    leftPlayerEmoji: leftPlayerEmoji,
                    rightPlayerEmoji: rightPlayerEmoji,
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
                await i.deferUpdate();
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

                const rematchRequestMessage = i18next.t('global.rematchRequestMessage', {
                    rematchRequester: rematchRequester,
                });
                const rematchRequestDeclinedMessage = i18next.t('global.rematchRequestDeclinedMessage', {
                    rematchRequester: rematchRequester,
                    rematchAccepter: rematchAccepter,
                });
                const rematchRequestIgnoredMessage = i18next.t('global.rematchRequestIgnoredMessage', {
                    rematchRequester: rematchRequester,
                    rematchAccepter: rematchAccepter,
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
                    await i.deferUpdate();
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

                acceptCollector.on('end', async () => {
                    if (gameMessage && !resettingCollector) {
                        await gameMessage.edit({
                            content: rematchRequestIgnoredMessage,
                            embeds: [gameEmbed],
                        });
                    }
                });
            });

            rematchCollector.on('end', async () => {
                if (gameMessage && !resettingCollector) {
                    await gameMessage.edit({
                        components: [],
                    });
                }
            });
        }
    });

    choiceCollector.on('end', async () => {
        if (gameMessage && !resettingCollector) {
            gameEmbed.setDescription(gameEndInactivityMessage);
            await gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};

export async function rockpaperscissorsBot(interaction: ChatInputCommandInteraction) {
    i18next.setDefaultNamespace('games');
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

    const rpsTitle = i18next.t('rockPaperScissors.rpsTitle');
    const hostedByFooter = i18next.t('global.hostedByFooter');
    const rockButtonLabel = i18next.t('rockPaperScissors.rockButtonLabel');
    const paperButtonLabel = i18next.t('rockPaperScissors.paperButtonLabel');
    const scissorsButtonLabel = i18next.t('rockPaperScissors.scissorsButtonLabel');
    const rockVersusRockResult = i18next.t('rockPaperScissors.rockVersusRockResult');
    const paperVersusPaperResult = i18next.t('rockPaperScissors.paperVersusPaperResult');
    const scissorsVersusScissorsResult = i18next.t('rockPaperScissors.scissorsVersusScissorsResult');
    const rockVersusScissorsResult = i18next.t('rockPaperScissors.rockVersusScissorsResult');
    const scissorsVersusPaperResult = i18next.t('rockPaperScissors.scissorsVersusPaperResult');
    const paperVersusRockResult = i18next.t('rockPaperScissors.paperVersusRockResult');

    const leftPlayer = Math.random() < 0.5 ? interaction.user : interaction.client.user;
    const rightPlayer = leftPlayer === interaction.user ? interaction.client.user : interaction.user;

    const chooseChoiceMessage = i18next.t('rockPaperScissors.chooseChoiceMessage', {
        leftPlayer: leftPlayer,
        rightPlayer: rightPlayer,
    });
    const gameEndInactivityMessage = i18next.t('rockPaperScissors.gameEndInactivityMessage', {
        leftPlayer: leftPlayer,
        rightPlayer: rightPlayer,
    });

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(rpsTitle)
        .setDescription(chooseChoiceMessage)
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
                        .setLabel(rockButtonLabel)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel(paperButtonLabel)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel(scissorsButtonLabel)
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
        await i.deferUpdate();
        resettingCollector = true;
        choiceCollector.stop();
        resettingCollector = false;

        userChoice = i.customId;
        userChoiceEmoji = choiceMap[userChoice];
        leftPlayerEmoji = leftPlayer === interaction.user ? userChoiceEmoji : botEmojiMap[userChoiceEmoji];
        rightPlayerEmoji = leftPlayer === interaction.user ? botEmojiMap[userChoiceEmoji] : userChoiceEmoji;

        const gameEndDrawMessage = i18next.t('rockPaperScissors.gameEndDrawMessage', {
            leftPlayer: leftPlayer,
            rightPlayer: rightPlayer,
            leftPlayerEmoji: leftPlayerEmoji,
            rightPlayerEmoji: rightPlayerEmoji,
        });
        const gameEndWinMessage = i18next.t('rockPaperScissors.gameEndWinMessage', {
            leftPlayer: leftPlayer,
            rightPlayer: rightPlayer,
            leftPlayerEmoji: leftPlayerEmoji,
            rightPlayerEmoji: rightPlayerEmoji,
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
            await i.deferUpdate();
            resettingCollector = true;
            rematchCollector.stop();
            resettingCollector = false;

            await rockpaperscissorsBot(interaction);
            return;
        });

        rematchCollector.on('end', async () => {
            if (gameMessage) {
                await gameMessage.edit({
                    components: [],
                });
            }
        });
    });

    choiceCollector.on('end', async () => {
        if (gameMessage && !resettingCollector) {
            gameEmbed.setDescription(gameEndInactivityMessage);
            await gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};