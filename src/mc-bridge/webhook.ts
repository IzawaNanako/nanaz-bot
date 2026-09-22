import { getConfig } from '@utils/config.js';
import type { Client, Webhook } from 'discord.js';

let bridgeWebhook: Webhook | null = null;

export async function sendToDiscordWebhook(
	client: Client,
	guildId: string,
	channelId: string,
	username: string,
	uuid: string,
	message: string,
) {
	try {
		const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);
		const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId);
		const bridgeConfig = getConfig().mcBridge;

		if (!channel?.isTextBased() || !('fetchWebhooks' in channel)) {
			console.error(`[MC Bridge] Error: Channel ${channelId} not found or does not support webhooks.`);
			return;
		}

		if (!bridgeWebhook || bridgeWebhook.channelId !== channelId) {
			const webhooks = await channel.fetchWebhooks();
			bridgeWebhook = webhooks.find(wh => wh.owner?.id === client.user?.id) || null;

			if (!bridgeWebhook) {
				console.log(`[MC Bridge] No webhook found in channel. Creating a new one...`);
				bridgeWebhook = await channel.createWebhook({
					name: 'Withering Bridge',
					reason: 'Created for Withering Bridge',
				});
			}
		}

		function resolveMentionsFromMinecraft(text: string): string {
			return text.replace(/@([a-zA-Z0-9_.\- ]{2,32})/g, (match, queryName) => {
				const cleanName = queryName.trim().toLowerCase();

				const member = guild.members.cache.find(m => m.displayName.toLowerCase() === cleanName || m.user.username.toLowerCase() === cleanName);
				if (member) {
					return `<@${member.id}>`;
				}

				const role = guild.roles.cache.find(r => r.name.toLowerCase() === cleanName);
				if (role) {
					return `<@&${role.id}>`;
				}

				return match;
			});
		}

		const resolvedMessage = resolveMentionsFromMinecraft(message);
		const trimmedUsername = username.trim().slice(0, 32) || 'Error Loading Player Name';
		const avatarURL = `https://mc-heads.net/avatar/${uuid}/256.png`;

		await bridgeWebhook.send({
			content: resolvedMessage,
			username: trimmedUsername,
			avatarURL: avatarURL,
			allowedMentions: bridgeConfig.allowPlayerMentions
				? {
					parse: [
						'users',
						'roles',
						'everyone',
					],
				}
				: {
					parse: [],
				},
		});
	} catch (error) {
		console.error(`[MC Bridge] Failed to send webhook message:`, error);
		bridgeWebhook = null;
	}
}

export async function sendSystemToDiscord(
	client: Client,
	guildId: string,
	channelId: string,
	message: string,
) {
	try {
		const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);
		const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId);

		if (!channel?.isTextBased() || !('send' in channel)) {
			return;
		}

		await channel.send({
			content: message,
			allowedMentions: {
				parse: [],
			},
		});
	} catch (error) {
		console.error(`[MC Bridge] Failed to send system message:`, error);
	}
}
