import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';
const WelcomeRole = sequelize.define('welcomeRole', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});
Guild.hasMany(WelcomeRole, {
    foreignKey: 'guildId',
});
WelcomeRole.belongsTo(Guild, {
    foreignKey: 'guildId',
});
export default WelcomeRole;
