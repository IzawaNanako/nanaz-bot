import 'dotenv/config.js';
import Guild from './src/models/guild.js';
import GuildMember from './src/models/guildMember.js';
import BannedMember from './src/models/bannedMember.js';
import User from './src/models/user.js';
import WelcomeRole from './src/models/welcomeRole.js';

await Guild.sync({
    force: true,
})
.then(() => {
    console.log('Guild Database synced.');
})
.catch((err) => {
    console.log(err);
});

await GuildMember.sync({
    force: true,
})
.then(() => {
    console.log('GuildMember Database synced.');
})
.catch((err) => {
    console.log(err);
});

await BannedMember.sync({
    force: true,
})
.then(() => {
    console.log('BannedMember Database synced.');
})
.catch((err) => {
    console.log(err);
});

await User.sync({
    force: true,
})
.then(() => {
    console.log('User Database synced.');
})
.catch((err) => {
    console.log(err);
});

await WelcomeRole.sync({
    force: true,
})
.then(() => {
    console.log('WelcomeRole Database synced.');
    process.exit(0);
})
.catch((err) => {
    console.log(err);
})