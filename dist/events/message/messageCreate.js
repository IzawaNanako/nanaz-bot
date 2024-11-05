import { ChannelType } from 'discord.js';
import { generateWithAI } from '../../utils/generateWithAI.js';
export const name = 'messageCreate';
export async function execute(message, client) {
    if (!client.user) {
        console.error('Client user not found.');
        process.exit(1);
    }
    if (message.author.bot) {
        return;
    }
    if (message.content === 'owo') {
        message.reply('owo!');
        return;
    }
    if (message.mentions.has(client.user, { ignoreEveryone: true, ignoreRoles: true }) || message.channel.type === ChannelType.DM) {
        try {
            let reply;
            if (message.author.id === process.env.OWNER_ID) {
                reply = await generateWithAI(message.content, true);
            }
            else {
                reply = await generateWithAI(message.content);
            }
            if (reply.length > 2000) {
                const replyArray = reply.match(/[\s\S]{1,2000}/g);
                replyArray?.forEach(async (msg) => {
                    await message.reply(msg);
                });
                return;
            }
            await message.reply(reply);
        }
        catch (error) {
            return;
        }
    }
}
