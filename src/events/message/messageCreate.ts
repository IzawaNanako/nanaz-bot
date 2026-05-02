import type { Client, Message } from 'discord.js';
import { Events, ChannelType, PermissionFlagsBits } from 'discord.js';
import { generateWithAI } from '@utils/generateWithAI.js';

export const name = Events.MessageCreate;
export async function execute(message: Message, client: Client) {
    if (!client.user) {
        console.error('Client user not found.');
        process.exit(1);
    }

    if (message.author.bot || (message.channel.type === ChannelType.GuildText && message.guild && message.guild.members.me && message.channel && (!message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.SendMessages) || !message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.ViewChannel)))) {
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

            // If the reply is too long, split it into multiple messages.
            if (reply.length > 2000) {
                const replyArray = reply.match(/[\s\S]{1,2000}/g);
                replyArray?.forEach(async (msg) => {
                    await message.reply(msg);
                });
                return;
            }

            await message.reply(reply);
        }
        catch {
            return;
        }
    }
}
