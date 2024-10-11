require('dotenv').config();

const { REST, Routes } = require('discord.js');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const rest = new REST().setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [],
    })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);