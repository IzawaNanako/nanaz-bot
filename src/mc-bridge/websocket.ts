import crypto from 'node:crypto';
import { getConfig } from '@utils/config.js';
import type { Client } from 'discord.js';
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import type { IncomingMcPayload } from './types.js';
import { sendSystemToDiscord, sendToDiscordWebhook } from './webhook.js';

function timingSafeCheck(incoming?: string, target?: string): boolean {
	if (!incoming || !target) {
		return false;
	}

	const incomingHash = crypto.createHash('sha256').update(incoming).digest();
	const targetHash = crypto.createHash('sha256').update(target).digest();

	return crypto.timingSafeEqual(incomingHash, targetHash);
}

export function startWsServer(port: number, host: string, secret: string, guildId: string, channelId: string, client: Client): WebSocketServer {
	const wss = new WebSocketServer({
		port,
		host,
		maxPayload: 1024 * 16,
	});

	wss.on('connection', (ws: WebSocket, req) => {
		const ip = req.socket.remoteAddress;

		let isAuthenticated = false;

		const authTimeout = setTimeout(() => {
			if (!isAuthenticated) {
				ws.close(1008, 'Authentication timeout');
			}
		}, 5000);

		ws.on('message', async (rawData: Buffer) => {
			try {
				const payload: IncomingMcPayload = JSON.parse(rawData.toString());

				if (!isAuthenticated) {
					if (payload.type === 'auth' && timingSafeCheck(payload.data?.secret, secret)) {
						isAuthenticated = true;
						clearTimeout(authTimeout);
						console.log('[MC Bridge] Minecraft server connected!');
					} else {
						ws.close(4001, 'Invalid Secret');
					}
					return;
				}

				switch (payload.type) {
					case 'chat_mc_to_discord':
						await sendToDiscordWebhook(
							client,
							guildId,
							channelId,
							payload.data.username,
							payload.data.uuid,
							payload.data.message,
						);
						break;

					case 'system_mc_to_discord': {
						const bridgeConfig = getConfig().mcBridge;
						const event = payload.data.eventType;

						if ((event === 'start' || event === 'stop') && !bridgeConfig.showStartStop) {
							break;
						}
						if (event === 'advancement' && !bridgeConfig.showAdvancements) {
							break;
						}
						if (event === 'death' && !bridgeConfig.showDeaths) {
							break;
						}
						if ((event === 'join' || event === 'leave') && !bridgeConfig.showJoinLeave) {
							break;
						}

						await sendSystemToDiscord(client, guildId, channelId, payload.data.message);
						break;
					}

					default:
						console.log(`[MC Bridge] Received unknown payload type.`);
				}
			} catch (error) {
				console.error(`[MC Bridge] Error parsing message from ${ip}:`, error);
			}
		});

		ws.on('close', (code, reason) => {
			clearTimeout(authTimeout);

			if (isAuthenticated) {
				const reasonText = reason.toString() || 'None';

				if (code === 1000) {
					console.log(`[MC Bridge] Minecraft server cleanly shut down. (${reasonText})`);
				} else if (code === 1006) {
					console.warn(`[MC Bridge] Minecraft server process terminated abruptly (Connection dropped / Code 1006).`);
				} else {
					console.log(`[MC Bridge] Minecraft server disconnected. Code: ${code} Reason: ${reasonText}`);
				}
			}
		});

		ws.on('error', (error) => {
			console.error(`[MC Bridge] WebSocket connection error:`, error);
		});
	});

	return wss;
}
