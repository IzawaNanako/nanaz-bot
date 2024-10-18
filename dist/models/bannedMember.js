import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';
const BannedMember = sequelize.define('bannedMember', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    totalBans: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    isBanned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bannedBy: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    bannedReason: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    bannedAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    bannedUntil: {
        type: Sequelize.DATE,
        allowNull: true,
    }
});
Guild.hasMany(BannedMember, {
    foreignKey: 'guildId',
});
BannedMember.belongsTo(Guild, {
    foreignKey: 'guildId',
});
export default BannedMember;
