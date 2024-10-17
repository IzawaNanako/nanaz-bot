require('dotenv').config();
const { REST, Routes } = require('discord.js');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const rest = new REST().setToken(token);

rest.get(Routes.applicationGuildCommands(clientId, guildId))
    .then((commands) => {
        const commandsToKeep = ['debug'];
        const commandsToDelete = commands.filter(command => !commandsToKeep.includes(command.name));

        const deletePromises = commandsToDelete.map(command => 
            rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id))
        );

        return Promise.all(deletePromises);
    })
    .then(() => console.log('Successfully reset all guild commands.'))
    .catch(console.error);