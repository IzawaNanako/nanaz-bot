import { getConfig } from '@utils/config.js';
import type { Client, Message } from 'discord.js';
import { WebSocket, type WebSocketServer } from 'ws';
import { parseDiscordMarkdown, truncateSpans } from './markdown.js';
import type { DiscordChatPayload } from './types.js';

export function registerDiscordListeners(client: Client, guildId: string, channelId: string, wss: WebSocketServer) {
	client.on('messageCreate', async (message: Message) => {
		const bridgeConfig = getConfig().mcBridge;

		if (message.author.bot) {
			return;
		}

		if (message.guild?.id !== guildId) {
			return;
		}

		if (message.channelId !== channelId) {
			return;
		}

		const MAX_VISIBLE_CHARS = 256;

		const fullSpans = parseDiscordMarkdown(message.content);
		const spans = truncateSpans(fullSpans, MAX_VISIBLE_CHARS);
		const attachments = message.attachments.map(att => att.url);
		const isEveryonePing = bridgeConfig.pingOnIgnMention ? message.mentions.everyone : false;
		const mentions = bridgeConfig.pingOnIgnMention ? message.mentions.users.map(u => u.globalName || u.username) : [];
		const roleColor = message.member?.displayColor || 0;

		const payload: DiscordChatPayload = {
			type: 'chat_discord_to_mc',
			data: {
				username: message.member?.nickname || message.author.globalName || message.author.username,
				message: message.cleanContent || message.content,
				spans,
				mentions: mentions,
				attachments: attachments,
				isEveryonePing: isEveryonePing,
				renderMarkdown: bridgeConfig.renderMarkdown,
				roleColor: roleColor,
			},
		};

		const payloadString = JSON.stringify(payload);

		wss.clients.forEach((clientWs) => {
			if (clientWs.readyState === WebSocket.OPEN) {
				clientWs.send(payloadString);
			}
		});
	});
}
