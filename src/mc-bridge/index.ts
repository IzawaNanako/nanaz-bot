import type { Client } from 'discord.js';
import { registerDiscordListeners } from './discord-events.js';
import { startWsServer } from './websocket.js';

export function initMcBridge(client: Client) {
	const port = Number(process.env.MC_BRIDGE_WS_PORT) || 5565;
	const secret = process.env.MC_BRIDGE_WS_SECRET;
	const guildId = process.env.MC_BRIDGE_GUILD_ID;
	const channelId = process.env.MC_BRIDGE_CHANNEL_ID;

	if (!secret || !guildId || !channelId) {
		console.error('[MC Bridge] ERROR: MC Bridge configuration missing in .env.');
		return;
	}

	console.log(`[MC Bridge] Starting up! Listening on port ${port}...`);

	const wss = startWsServer(port, secret, guildId, channelId, client);

	registerDiscordListeners(client, guildId, channelId, wss);
}
