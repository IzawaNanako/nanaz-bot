import 'dotenv/config.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getConfig } from '@utils/config.js';
import { REST, type RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

if (!clientId || !token) {
	throw new Error('Client ID or token not found.');
}

const config = getConfig();

const featureMap: Record<string, keyof typeof config.features> = {
	help: 'help',
	avatar: 'avatar',
	banner: 'banner',
	userinfo: 'userinfo',
	servericon: 'serverIcon',
	send: 'send',
	reminder: 'reminder',
	ping: 'ping',
	'set-timezone': 'setTimezone',
	serverinfo: 'serverInfo',
	translate: 'translate',
	language: 'language',
	challenge: 'challenge',
	'flip-a-coin': 'flipACoin',
	owo: 'owo',
	ban: 'ban',
	baninfo: 'banInfo',
	kick: 'kick',
	mute: 'mute',
	'set-channel': 'setChannel',
	'set-message': 'setMessage',
	'set-server-language': 'setServerLanguage',
	unban: 'unban',
	'welcome-roles': 'welcomeRoles',
	'User Avatar': 'userAvatar',
	'User Banner': 'userBanner',
	'Translate Message': 'translateMessage',
	'User Info': 'userInfoContext',
};

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const foldersPath = join('dist/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath);

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const filePathURL = pathToFileURL(`./${filePath}`);
		const command = await import(`${filePathURL}`);

		if (!('data' in command) || !('execute' in command)) {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			continue;
		}

		const commandName = command.data.name;
		if (commandName === 'dev') {
			continue;
		}

		const featureKey = featureMap[commandName];
		if (featureKey && config.features[featureKey] === false) {
			console.log(`[INFO] Skipping /${commandName} (disabled in config).`);
			continue;
		}

		commands.push(command.data.toJSON());
	}
}

async function reloadGlobalCommands(): Promise<void> {
	try {
		console.log(`Started reloading ${commands.length} application commands.`);

		const rest = new REST().setToken(token);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{
				body: commands,
			},
		) as unknown[];

		console.log(`Successfully reloaded ${data.length} application commands.`);
	} catch (error) {
		console.error(error);
	}
}

await reloadGlobalCommands();
