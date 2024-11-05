import 'dotenv/config.js';
import { REST, Routes, ApplicationCommand } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

if (!clientId || !token) {
    throw new Error('Client ID or token not found.');
}

const commands = [];
const foldersPath = join('dist/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath);
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
        const filePathURL = pathToFileURL(`./${filePath}`);
		const command = await import(`${filePathURL}`);
		if ('data' in command && 'execute' in command && command.data.name !== 'dev') {
			commands.push(command.data.toJSON());
		}
        else if (command.data.name === 'dev') {
            continue;
        }
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{
                body: commands,
            },
		) as ApplicationCommand[];

		console.log(`Successfully reloaded ${data.length} application commands.`);
        process.exit(0);
	}
    catch (error) {
		console.error(error);
        process.exit(1);
	}
})();