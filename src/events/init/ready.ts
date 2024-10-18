import { Events } from 'discord.js';
import BotSetting from '../../models/botSetting';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const bot = await BotSetting.findOrCreate({
        where: {
            id: 'Nanaz',
        }
    });

    if (bot.activityType === 'none') {
        await client.user.setStatus(bot.status);
    }
    else if (bot.activityType === 'ActivityType.Custom') {
        await client.user.setPresence({
            activities: [{
                name: 'custom',
                type: bot.activityType,
                state: bot.activityName,
            }],
            status: bot.status,
        });
    }
    else if (bot.activityType === 'ActivityType.Streaming') {
        await client.user.setPresence({
            activities: [{
                name: bot.activityName,
                type: bot.activityType,
                url: bot.activityUrl,
            }],
            status: bot.status,
        });
    }
    else {
        await client.user.setPresence({
            activities: [{
                name: bot.activityName,
                type: bot.activityType,
            }],
            status: bot.status,
        });
    }
}