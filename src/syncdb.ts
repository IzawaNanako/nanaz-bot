import 'dotenv/config.js';
import Guild from './models/guild.js';
import GuildMember from './models/guildMember.js';
import BannedMember from './models/bannedMember.js';
import User from './models/user.js';
import WelcomeRole from './models/welcomeRole.js';
import BotSettings from './models/botSettings.js';

await Guild.sync({
    alter: true,
})
.then(() => {
    console.log('Guild Database synced.');
})
.catch((error) => {
    console.log(error);
});

await GuildMember.sync({
    alter: false,
})
.then(() => {
    console.log('GuildMember Database synced.');
})
.catch((error) => {
    console.log(error);
});

await BannedMember.sync({
    alter: false,
})
.then(() => {
    console.log('BannedMember Database synced.');
})
.catch((error) => {
    console.log(error);
});

await User.sync({
    alter: true,
})
.then(() => {
    console.log('User Database synced.');
})
.catch((error) => {
    console.log(error);
});

await WelcomeRole.sync({
    alter: false,
})
.then(() => {
    console.log('WelcomeRole Database synced.');
})
.catch((error) => {
    console.log(error);
})

await BotSettings.sync({
    alter: false,
})
.then(() => {
    console.log('BotSettings Database synced.');
})
.catch((error) => {
    console.log(error);
})

process.exit(0);