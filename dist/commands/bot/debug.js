import { SlashCommandBuilder, PermissionFlagsBits, PresenceUpdateStatus, ActivityType } from 'discord.js';
import BotSetting from '../../models/botSetting.js';
export const data = new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug commands that control the bot directly, accessible only by the developer.')
    .addStringOption(option => option
    .setName('option')
    .setDescription('The action to take.')
    .setRequired(true)
    .addChoices({
    name: 'stop',
    value: 'stop',
}, {
    name: 'username',
    value: 'username',
}, {
    name: 'status',
    value: 'status',
}, {
    name: 'reload-cmd',
    value: 'reload-cmd',
}))
    .addStringOption(option => option
    .setName('value')
    .setDescription('The value to set, if one is needed.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(0);
export async function execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
            content: 'You do not have the permission to use this command.',
            ephemeral: true,
        });
        return;
    }
    const statusMap = {
        'online': PresenceUpdateStatus.Online,
        'idle': PresenceUpdateStatus.Idle,
        'dnd': PresenceUpdateStatus.DoNotDisturb,
        'invisible': PresenceUpdateStatus.Invisible,
    };
    const activityMap = {
        'playing': ActivityType.Playing,
        'streaming': ActivityType.Streaming,
        'listening': ActivityType.Listening,
        'watching': ActivityType.Watching,
        'competing': ActivityType.Competing,
        'custom': ActivityType.Custom,
        'none': 'none',
    };
    const option = interaction.options.getString('option');
    let value = interaction.options.getString('value');
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
                ephemeral: true,
            });
            return;
        }
        try {
            await interaction.reply({
                content: `Changing my username to ${value}...`,
            });
            await interaction.client.user.setUsername(value);
        }
        catch (error) {
            await interaction.reply({
                content: 'Failed to set username.',
                ephemeral: true,
            });
            console.log(error);
        }
    }
    else if (option === 'status') {
        if (value) {
            await interaction.reply({
                content: 'Invalid format, keep value field empty for this option.',
                ephemeral: true,
            });
            return;
        }
        await interaction.reply({
            content: 'Please enter a status: "online", "idle", "dnd" or "invisible".',
        });
        let responseStatus = await interaction.channel
            .awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        })
            .catch(() => {
            return null;
        });
        const status = statusMap[responseStatus.first().content.toLowerCase()];
        if (!status) {
            await responseStatus.first().reply({
                content: 'Invalid status.',
            });
            return;
        }
        await responseStatus.first().reply({
            content: 'Please enter activity type: "playing", "streaming", "listening", "watching", "competing", "custom" or "none".',
        });
        let responseActivityType = await interaction.channel
            .awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        })
            .catch(() => {
            return null;
        });
        const activityType = activityMap[responseActivityType.first().content.toLowerCase()];
        if (!activityType) {
            await responseActivityType.first().reply({
                content: 'Invalid activity type.',
            });
            return;
        }
        if (activityType === 'none') {
            await responseActivityType.first().reply({
                content: 'Setting status...',
            });
            await interaction.client.user.setStatus(status);
            storeStatus(status, activityType, null, null);
        }
        else if (activityType === ActivityType.Custom) {
            await responseActivityType.first().reply({
                content: 'Please enter the activity texts.',
            });
            let responseActivityTexts = await interaction.channel
                .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .catch(() => {
                return null;
            });
            const activityTexts = responseActivityTexts.first().content;
            try {
                await responseActivityType.first().reply({
                    content: 'Setting status...',
                });
                await interaction.client.user.setPresence({
                    activities: [{
                            name: 'custom',
                            type: activityType,
                            state: activityTexts,
                        }],
                    status: status,
                });
                storeStatus(status, activityType, activityTexts, null);
            }
            catch (error) {
                await responseActivityType.first().reply({
                    content: 'Failed to set status.',
                });
                console.log(error);
            }
        }
        else if (activityType === ActivityType.Streaming) {
            await responseActivityType.first().reply({
                content: 'Please enter the text after stream name.',
            });
            let responseStreamingName = await interaction.channel
                .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .catch(() => {
                return null;
            });
            const streamingName = responseStreamingName.first().content;
            await responseActivityType.first().reply({
                content: 'Please enter stream URL, only Twitch and Youtube URLs are supported.',
            });
            let responseStreamingURL = await interaction.channel
                .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .catch(() => {
                return null;
            });
            const streamingURL = responseStreamingURL.first().content;
            try {
                await responseActivityType.first().reply({
                    content: 'Setting status...',
                });
                await interaction.client.user.setPresence({
                    activities: [{
                            name: streamingName,
                            type: activityType,
                            url: streamingURL,
                        }],
                    status: status,
                });
                storeStatus(status, activityType, streamingName, streamingURL);
            }
            catch (error) {
                await responseActivityType.first().reply({
                    content: 'Failed to set status.',
                    ephemeral: true,
                });
                console.log(error);
            }
        }
        else {
            await responseActivityType.first().reply({
                content: 'Please enter activity name.',
            });
            let responseActivityName = await interaction.channel
                .awaitMessages({
                filter: m => m.author.id === interaction.user.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .catch(() => {
                return null;
            });
            const activityName = responseActivityName.first().content;
            try {
                await responseActivityType.first().reply({
                    content: 'Setting status...',
                });
                await interaction.client.user.setPresence({
                    activities: [{
                            name: activityName,
                            type: activityType,
                        }],
                    status: status,
                });
                storeStatus(status, activityType, activityName, null);
            }
            catch (error) {
                await responseActivityType.first().reply({
                    content: 'Failed to set status.',
                });
                console.log(error);
            }
        }
    }
    else if (option === 'reload-cmd') {
        const commandName = value.toLowerCase();
        const command = interaction.client.commands.get(commandName);
        if (!command) {
            await interaction.reply({
                content: 'Invalid command.',
                ephemeral: true,
            });
            return;
        }
        try {
            const newCommand = await import(`../${commandName}.js?update=${Date.now()}`);
            if (!newCommand.data || !newCommand.execute) {
                await interaction.reply({
                    content: 'The command file is missing a required "data" or "execute" property.',
                    ephemeral: true,
                });
                return;
            }
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({
                content: 'Reloaded command.',
                ephemeral: true,
            });
        }
        catch (error) {
            await interaction.reply({
                content: 'Failed to reload command.',
                ephemeral: true,
            });
            console.log(error);
        }
    }
    else {
        await interaction.reply({
            content: 'Invalid option.',
            ephemeral: true,
        });
    }
}
function storeStatus(status, activityType, activityName, activityUrl) {
    const bot = BotSetting.findOne({
        where: {
            id: 'Nanaz',
        },
    });
    bot.update({
        status: status,
        activityType: activityType,
        activityName: activityName,
        activityUrl: activityUrl,
    });
}
