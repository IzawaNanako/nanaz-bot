import { EmbedBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, User, ActionRowBuilder, MessageComponentInteraction } from 'discord.js';
import rematchButton from '../utils/rematchButton.js';

const choiceMap: {[key: string]: string} = {
    'rock': '🪨',
    'paper': '📄',
    'scissors': '✂️',
};

export async function rockpaperscissors(interaction: CommandInteraction, opponent: User) {
    const leftPlayer = Math.random() < 0.5 ? interaction.user : opponent;
    const rightPlayer = leftPlayer === interaction.user ? opponent : interaction.user;

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Rock Paper Scissors')
        .setDescription(`${leftPlayer} ⚔️ ${rightPlayer}\n\nChoose your move!`)
        .setImage('https://i.imgur.com/8r6dKEH.png')
        .setFooter({
            text: `Hosted by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined
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
                        .setLabel('🪨 Rock')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel('📄 Paper')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel('✂️ Scissors')
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
                gameEmbed
                    .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n**It's a draw!**`);
                if (userChoice === 'rock') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Rock + Rock = Pile of rocks!`
                            }
                        ])
                        .setImage('https://i.imgur.com/tGBxsYc.png')
                }
                else if (userChoice === 'paper') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Paper + Paper = Stack of paper!`
                            }
                        ])
                        .setImage('https://i.imgur.com/1yzgQ0K.png')
                }
                else {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Scissors + Scissors = Never ending fight!`
                            }
                        ])
                        .setImage('https://i.imgur.com/pD7JrnS.png')
                }
            }
            else if ((userChoice === 'rock' && opponentChoice === 'scissors') || (userChoice === 'scissors' && opponentChoice === 'rock')) {
                gameEmbed
                    .setDescription(`${userChoiceEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${userChoice === 'rock' ? interaction.user : opponent} **Won!**`)
                    .addFields([
                        {
                            name: '\u200b',
                            value: `Rock + Scissors = Broken scissors!`
                        }
                    ])
                    .setImage('https://i.imgur.com/AIF5JpE.png');
            }
            else if ((userChoice === 'scissors' && opponentChoice === 'paper') || (userChoice === 'paper' && opponentChoice === 'scissors')) {
                gameEmbed
                    .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${userChoice === 'scissors' ? interaction.user : opponent} **Won!**`)
                    .addFields([
                        {
                            name: '\u200b',
                            value: `Scissors + Paper = Torn paper!`
                        }
                    ])
                    .setImage('https://i.imgur.com/CUi7LYq.png');
            }
            else if ((userChoice === 'paper' && opponentChoice === 'rock') || (userChoice === 'rock' && opponentChoice === 'paper')) {
                gameEmbed
                    .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${userChoice === 'paper' ? interaction.user : opponent} **Won!**`)
                    .addFields([
                        {
                            name: '\u200b',
                            value: `Paper + Rock = Crumpled paper ball!`
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
                    .setTitle('Rock Paper Scissors')
                    .setFooter({
                        text: `Hosted by Nanaz`,
                        iconURL: interaction.user.avatarURL() ?? undefined,
                    })
                    .setTimestamp();

                const rematchRequester = i.user;
                const rematchAccepter = i.user === interaction.user ? opponent : interaction.user;

                await gameMessage.edit({
                    content: `${rematchAccepter}`,
                    embeds: [
                        rematchEmbed
                            .setDescription(`${rematchRequester} wants to rematch! Do you accept?`)
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
                                    .setStyle(ButtonStyle.Danger),
                        )
                    ],
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
                            content: `${rematchAccepter} has declined a rematch requested by ${rematchRequester}.`,
                            embeds: [gameEmbed],
                        });
                    }
                });

                acceptCollector.on('end', () => {
                    if (gameMessage && !resettingCollector) {
                        gameMessage.edit({
                            content: `${rematchAccepter} didn't respond to a rematch requested by ${rematchRequester}.`,
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
            gameEmbed.setDescription(`${leftPlayer} ⚔️ ${rightPlayer}\n\nGame ended due to inactivity.`);
            gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};

export async function rockpaperscissorsBot(interaction: CommandInteraction) {
    const botEmojiMap: { [key: string]: string } = {
        '🪨': '📄',
        '📄': '✂️',
        '✂️': '🪨',
    };

    const leftPlayer = Math.random() < 0.5 ? interaction.user : interaction.client.user;
    const rightPlayer = leftPlayer === interaction.user ? interaction.client.user : interaction.user;

    const gameEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Rock Paper Scissors')
        .setDescription(`${interaction.user} ⚔️ ${interaction.client.user}`)
        .setImage('https://i.imgur.com/8r6dKEH.png')
        .setFooter({
            text: `Hosted by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined
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
                        .setLabel('🪨 Rock')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paper')
                        .setLabel('📄 Paper')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('scissors')
                        .setLabel('✂️ Scissors')
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

        if (Math.random() < 0.05) {
            gameEmbed
                .setDescription(`${userChoiceEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${userChoiceEmoji}\n\n**It's a draw!**`)
                if (userChoice === 'rock') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Rock + Rock = Pile of rocks!`
                            }
                        ])
                        .setImage('https://i.imgur.com/tGBxsYc.png')
                }
                else if (userChoice === 'paper') {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Paper + Paper = Stack of paper!`
                            }
                        ])
                        .setImage('https://i.imgur.com/1yzgQ0K.png')
                }
                else {
                    gameEmbed
                        .addFields([
                            {
                                name: '\u200b',
                                value: `Scissors + Scissors = Never ending fight!`
                            }
                        ])
                        .setImage('https://i.imgur.com/pD7JrnS.png')
                }
        }
        else if (userChoice === 'rock') {
            gameEmbed
                .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${interaction.client.user} **Won!**`)
                .addFields([
                    {
                        name: '\u200b',
                        value: `Paper + Rock = Crumpled paper ball!`
                    }
                ])
                .setImage('https://i.imgur.com/fPMYgBK.png');
        }
        else if (userChoice === 'paper') {
            gameEmbed
                .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${interaction.client.user} **Won!**`)
                .addFields([
                    {
                        name: '\u200b',
                        value: `Scissors + Paper = Torn paper!`
                    }
                ])
                .setImage('https://i.imgur.com/CUi7LYq.png');
        }
        else {
            gameEmbed
                .setDescription(`${leftPlayerEmoji} ${leftPlayer} ⚔️ ${rightPlayer} ${rightPlayerEmoji}\n\n👑 ${interaction.client.user} **Won!**`)
                .addFields([
                    {
                        name: '\u200b',
                        value: `Rock + Scissors = Broken scissors!`
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
            gameEmbed.setDescription(`${leftPlayer} ⚔️ ${rightPlayer}\n\nGame ended due to inactivity.`);
            gameMessage.edit({
                embeds: [gameEmbed],
                components: [],
            });
        }
    });
};