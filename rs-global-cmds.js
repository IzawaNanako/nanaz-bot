import 'dotenv/config.js';
import { REST, Routes } from 'discord.js';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

const rest = new REST().setToken(token);

rest.put(Routes.applicationCommands(clientId), {
        body: [],
    })
	.then(() => console.log('Successfully deleted all global commands.'))
	.catch(console.error);