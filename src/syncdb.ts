import 'dotenv/config.js';
import { Guild } from './models/guild.js';
import { GuildMember } from './models/guildMember.js';
import { BannedMember } from './models/bannedMember.js';
import { User } from './models/user.js';
import { WelcomeRole } from './models/welcomeRole.js';
import { BotSettings } from './models/botSettings.js';
import { Reminder } from './models/reminder.js';

const models = [
    Guild,
    GuildMember,
    BannedMember,
    User,
    WelcomeRole,
    BotSettings,
    Reminder,
];

try {
    console.log('⏳ Syncing database...');

    for (const model of models) {
        await model.sync({
            alter: true,
        });
        console.log(`✅ Synced: ${model.name}`);
    }

    console.log('🎉 All models synced.');
    process.exit(0);
} 
catch (error) {
    console.error('❌ Failed to sync DB:', error);
    process.exit(1);
}
