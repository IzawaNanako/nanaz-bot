import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';

const WelcomeRole = sequelize.define('welcomeRole', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    }
});

Guild.hasMany(WelcomeRole, {
    foreignKey: 'guildId',
});
WelcomeRole.belongsTo(Guild, {
    foreignKey: 'guildId',
});

export default WelcomeRole;