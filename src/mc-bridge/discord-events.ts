import { getConfig } from '@utils/config.js';
import type { Client, Message } from 'discord.js';
import { MessageType } from 'discord.js';
import type { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import { parseDiscordMarkdown, truncate, truncateSpans, wrapHoverText } from './markdown.js';
import type { DiscordChatPayload, ReplyData } from './types.js';

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

		if (message.type !== MessageType.Default && message.type !== MessageType.Reply) {
			return;
		}

		if (!message.content && message.attachments.size === 0) {
			return;
		}

		const MAX_VISIBLE_CHARS = 240;

		const fullSpans = parseDiscordMarkdown(message);
		const spans = truncateSpans(fullSpans, MAX_VISIBLE_CHARS);
		const attachments = message.attachments.map(att => att.url);
		const isEveryonePing = bridgeConfig.pingOnIgnMention ? message.mentions.everyone : false;
		const mentions = bridgeConfig.pingOnIgnMention ? message.mentions.users.map(u => u.globalName || u.username) : [];
		const roleColor = message.member?.displayColor || 0;

		let replyData: ReplyData | undefined;

		if (message.type === MessageType.Reply && message.reference?.messageId) {
			try {
				const referencedMsg = await message.channel.messages.fetch(message.reference.messageId);
				if (referencedMsg) {
					const author = referencedMsg.member?.displayName ?? referencedMsg.author.username;
					const cleanMsg = referencedMsg.cleanContent || (referencedMsg.attachments.size > 0 ? '[Attachment]' : '');
					replyData = {
						author,
						preview: truncate(cleanMsg.replace(/\n+/g, ' '), 32),
						hoverText: wrapHoverText(cleanMsg, 45, 240),
					};
				}
			} catch {}
		}

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
				replyData,
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
