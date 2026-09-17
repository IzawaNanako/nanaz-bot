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
					name: 'MC Bridge',
					reason: 'Created for Minecraft Chat Bridge',
				});
			}
		}

		const avatarURL = `https://mc-heads.net/avatar/${uuid}/256.png`;

		await bridgeWebhook.send({
			content: message,
			username: username,
			avatarURL: avatarURL,
			allowedMentions: {
				parse: [
					'users',
					'roles',
				],
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
			content: `**${message}**`,
			allowedMentions: {
				parse: [],
			},
		});
	} catch (error) {
		console.error(`[MC Bridge] Failed to send system message:`, error);
	}
}
