import { Events, ActivityType } from 'discord.js';
import BotSettings from '../../models/botSettings.js';
export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
    if (!client.user) {
        console.error('Client user not found.');
        process.exit(1);
    }
    console.log(`Ready! Logged in as ${client.user.tag}`);
    const activityMap = {
        'playing': ActivityType.Playing,
        'streaming': ActivityType.Streaming,
        'listening': ActivityType.Listening,
        'watching': ActivityType.Watching,
        'competing': ActivityType.Competing,
        'custom': ActivityType.Custom,
    };
    const [bot] = await BotSettings.findOrCreate({
        where: {
            id: 'Nanaz',
        }
    });
    if (!bot.status || !bot.activityType) {
        console.error('Bot status or activity type not found.');
        process.exit(1);
    }
    const status = bot.status;
    if (bot.activityType === 'none') {
        client.user.setPresence({
            activities: [],
            status: status,
        });
        return;
    }
    else if (!bot.activityName) {
        console.error('Bot activity name not found.');
        process.exit(1);
    }
    const activityType = activityMap[bot.activityType];
    if (activityType === ActivityType.Custom) {
        client.user.setPresence({
            activities: [{
                    name: 'custom',
                    type: activityType,
                    state: bot.activityName,
                }],
            status: status,
        });
    }
    else if (activityType === ActivityType.Streaming) {
        if (!bot.activityUrl) {
            console.error('Activity URL not found. Ignoring activity.');
            return;
        }
        client.user.setPresence({
            activities: [{
                    name: bot.activityName,
                    type: activityType,
                    url: bot.activityUrl,
                }],
            status: status,
        });
    }
    else {
        client.user.setPresence({
            activities: [{
                    name: bot.activityName,
                    type: activityType,
                }],
            status: status,
        });
    }
}
