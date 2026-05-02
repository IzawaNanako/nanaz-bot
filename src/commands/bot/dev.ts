import type { ChatInputCommandInteraction, PresenceStatusData, TextChannel } from 'discord.js';
import { ActivityType, InteractionContextType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotSettings } from '@models/botSettings.js';

export const data = new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Developer commands that control the bot directly, accessible only by the developer.')
    .addStringOption(option => option
        .setName('option')
        .setDescription('The action to take.')
        .setRequired(true)
        .addChoices(
            {
                name: 'stop',
                value: 'stop',
            },
            {
                name: 'username',
                value: 'username',
            },
            {
                name: 'status',
                value: 'status',
            },
            {
                name: 'test',
                value: 'test',
            }
        )
    )
    .addStringOption(option => option
        .setName('value')
        .setDescription('The value to set, if one is needed.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild);
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
            content: 'You do not have the permission to use this command.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    if (!interaction.channel) {
        await interaction.reply({
            content: 'Something went wrong...',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const channel = interaction.channel as TextChannel;
    const statuses = [
        'online',
        'idle',
        'dnd',
        'invisible',
    ];
    const activityMap: { [key: string]: ActivityType } = {
        'playing': ActivityType.Playing,
        'streaming': ActivityType.Streaming,
        'listening': ActivityType.Listening,
        'watching': ActivityType.Watching,
        'competing': ActivityType.Competing,
        'custom': ActivityType.Custom,
    }
    const option = interaction.options.getString('option', true);
    const value = interaction.options.getString('value');

    if (option === 'stop') {
        await interaction.reply({
            content: 'Shutting down...',
        });
        process.exit(0);
    }
    else if (option === 'username') {
        if (!value) {
            await interaction.reply({
                content: 'Please provide a name.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        try {
            await interaction.client.user.setUsername(value);
            await interaction.reply({
                content: `Changing my username to ${value}...`,
            });
        }
        catch (error) {
            await interaction.reply({
                content: 'Failed to set username.',
                flags: MessageFlags.Ephemeral,
            });
            console.log(error);
        }
    }
    else if (option === 'status') {
        if (value) {
            await interaction.reply({
                content: 'Invalid format, keep value field empty for this option.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.reply({
            content: 'Please enter a status: "online", "idle", "dnd" or "invisible".',
        });
        const responseStatus = await channel
            .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
            .catch(() => {
                return null;
            });
        const status = responseStatus?.first()?.content.toLowerCase();

        if (!status || !statuses.includes(status)) {
            await responseStatus?.first()?.reply({
                content: 'Invalid status.',
            });
            return;
        }

        await responseStatus?.first()?.reply({
            content: 'Please enter activity type: "playing", "streaming", "listening", "watching", "competing", "custom" or "none".',
        });
        const responseActivityType = await channel
            .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
            .catch(() => {
                return null;
            });
        const activityType = responseActivityType?.first()?.content.toLowerCase() as string;
        const activityTypeMapped = activityMap[activityType];

        if (((activityTypeMapped === null || activityTypeMapped === undefined) && activityType !== 'none') || !activityType) {
            await responseActivityType?.first()?.reply({
                content: 'Invalid activity type.',
            });
            return;
        }

        if (activityType === 'none') {
            await responseActivityType?.first()?.reply({
                content: 'Setting status...',
            });
            interaction.client.user.setPresence({
                activities: [],
                status: status as PresenceStatusData,
            });
            storeStatus(status, activityType, null, null);
        }
        else if (activityType === 'custom') {
            await responseActivityType?.first()?.reply({
                content: 'Please enter the activity texts.',
            });
            const responseActivityTexts = await channel
                .awaitMessages({
                    filter: m => m.author.id === interaction.user.id,
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                })
                .catch(() => {
                    return null;
                });
            const activityTexts = responseActivityTexts?.first()?.content;

            if (!activityTexts) {
                await responseActivityType?.first()?.reply({
                    content: 'Failed to set status. Check your input.',
                });
                return;
            }

            try {
                await responseActivityTexts?.first()?.reply({
                    content: 'Setting status...',
                });
                interaction.client.user.setPresence({
                    activities: [{
                        name: 'custom',
                        type: activityTypeMapped,
                        state: activityTexts,
                    }],
                    status: status as PresenceStatusData,
                });
                storeStatus(status, activityType, activityTexts, null);
            }
            catch (error) {
                await responseActivityTexts?.first()?.reply({
                    content: 'Failed to set status. Try again later.',
                });
                console.log(error);
            }
        }
        else if (activityType === 'streaming') {
            await responseActivityType?.first()?.reply({
                content: 'Please enter the text after stream name.',
            });
            const responseStreamName = await channel
                .awaitMessages({
                    filter: m => m.author.id === interaction.user.id,
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                })
                .catch(() => {
                    return null;
                });
            const streamName = responseStreamName?.first()?.content ?? undefined;

            await responseStreamName?.first()?.reply({
                content: 'Please enter stream URL, only Twitch and Youtube URLs are supported.',
            });
            const responseStreamURL = await channel
                .awaitMessages({
                    filter: m => m.author.id === interaction.user.id,
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                })
                .catch(() => {
                    return null;
                });
            const streamURL = responseStreamURL?.first()?.content;

            if (!streamName || !streamURL) {
                await responseActivityType?.first()?.reply({
                    content: 'Failed to set status. Check your input.',
                });
                return;
            }

            try {
                await responseStreamURL?.first()?.reply({
                    content: 'Setting status...',
                });
                interaction.client.user.setPresence({
                    activities: [{
                        name: streamName,
                        type: activityTypeMapped,
                        url: streamURL,
                    }],
                    status: status as PresenceStatusData,
                });
                storeStatus(status, activityType, streamName, streamURL);
            }
            catch (error) {
                await responseStreamURL?.first()?.reply({
                    content: 'Failed to set status. Try again later.',
                });
                console.log(error);
            }
        }
        else {
            await responseActivityType?.first()?.reply({
                content: 'Please enter activity name.',
            });
            const responseActivityName = await channel
                .awaitMessages({
                    filter: m => m.author.id === interaction.user.id,
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                })
                .catch(() => {
                    return null;
                });
            const activityName = responseActivityName?.first()?.content;

            if (!activityName) {
                await responseActivityType?.first()?.reply({
                    content: 'Failed to set status. Check your input.',
                });
                return;
            }

            try {
                await responseActivityName?.first()?.reply({
                    content: 'Setting status...',
                });
                interaction.client.user.setPresence({
                    activities: [{
                        name: activityName,
                        type: activityTypeMapped,
                    }],
                    status: status as PresenceStatusData,
                });
                storeStatus(status, activityType, activityName, null);
            }
            catch (error) {
                await responseActivityName?.first()?.reply({
                    content: 'Failed to set status. Try again later.',
                });
                console.log(error);
            }
        }
    }
    else if (option === 'test') {
        await interaction.reply({
            content: 'This is a test command.',
            flags: MessageFlags.Ephemeral,
        });
        console.log('Test command executed by: ', interaction.user.displayName);
    }
    else {
        await interaction.reply({
            content: 'Invalid option.',
            flags: MessageFlags.Ephemeral,
        });
    }
}

/**
 * Store the bot status in the database.
 * @param status The status to set.
 * @param activityType The activity type to set.
 * @param activityName The activity name to set, or null if not applicable.
 * @param activityUrl The activity URL to set, or null if not applicable.
 */
async function storeStatus(status: string, activityType: string, activityName: string | null, activityUrl: string | null) {
    const bot = await BotSettings.findOne({
        where: {
            id: 'Nanaz',
        },
    });

    if (!bot) {
        console.error('Bot not found.');
        process.exit(1);
    }

    await bot.update({
        status: status,
        activityType: activityType,
        activityName: activityName,
        activityUrl: activityUrl ?? null,
    });
}
