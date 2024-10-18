import 'dotenv/config.js';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

const commands = [];
const foldersPath = join('./src/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = await import(`./${filePath}`);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{
                body: commands,
            },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
    catch (error) {
		console.error(error);
	}
})();