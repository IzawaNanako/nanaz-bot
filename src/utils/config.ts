import fs from 'node:fs';
import path from 'node:path';

export interface BotConfig {
	ai: {
		modelName: string;
		temperature: number;
		ownerName: string;
		rules: string;
		preset: string;
	};
	mcBridge: {
		allowPlayerMentions: boolean;
		showStartStop: boolean;
		showAdvancements: boolean;
		showDeaths: boolean;
		showJoinLeave: boolean;
		pingOnIgnMention: boolean;
		renderMarkdown: boolean;
	};
	features: FeatureConfig;
}

export interface FeatureConfig {
	aiChat: boolean;
	mcBridge: boolean;
	help: boolean;
	avatar: boolean;
	banner: boolean;
	userinfo: boolean;
	serverIcon: boolean;
	send: boolean;
	reminder: boolean;
	ping: boolean;
	setTimezone: boolean;
	serverInfo: boolean;
	translate: boolean;
	language: boolean;
	challenge: boolean;
	flipACoin: boolean;
	owo: boolean;
	ban: boolean;
	banInfo: boolean;
	kick: boolean;
	mute: boolean;
	setChannel: boolean;
	setMessage: boolean;
	setServerLanguage: boolean;
	unban: boolean;
	welcomeRoles: boolean;
	userAvatar: boolean;
	userBanner: boolean;
	translateMessage: boolean;
	userInfoContext: boolean;
}

const configPath = path.resolve(process.cwd(), 'config.json');

export function getConfig(): BotConfig {
	try {
		const data = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading config file:', error);
		throw new Error('Could not load configuration.');
	}
}

export function updateConfig(newSettings: Partial<BotConfig>): void {
	const currentConfig = getConfig();
	const updatedConfig = { ...currentConfig, ...newSettings };

	fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
}
