const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChannelType } = require('discord.js');
const geminiAPIKey = process.env.GEMINI_API_KEY;

const MODEL_NAME = 'gemini-1.5-flash';
const genAI = new GoogleGenerativeAI(geminiAPIKey);

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) {
            return;
        }

        if (message.content === 'owo') {
            message.reply('owo!');
            return;
        }
        
        if (message.mentions.has(client.user) || message.channel.type === ChannelType.DM) {
            const userMessage = message.content
                .replace(`<@!${client.user.id}>`, '')
                .trim();

            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            const generationConfig = {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            };

            const parts = [
                {
                text: `input: ${userMessage}`,
                },
            ];

            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
                generationConfig,
            });

            const reply = await result.response.text();

            if (reply.length > 2000) {
                const replyArray = reply.match(/[\s\S]{1,2000}/g);
                replyArray.forEach(async (msg) => {
                    await message.reply(msg);
                });
                return;
            }
            await message.reply(reply);
        }
    }
};
