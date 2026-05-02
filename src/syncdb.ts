import 'dotenv/config.js';
import { User } from '@models/user.js';

const models = [
    User,
];

try {
    console.log('Syncing database...');

    for (const model of models) {
        await model.sync({
            alter: true,
        });

        console.log(`Synced: ${model.name}`);
    }

    console.log('All models synced.');
    process.exit(0);
} 
catch (error) {
    console.error('Failed to sync DB:', error);
    process.exit(1);
}
