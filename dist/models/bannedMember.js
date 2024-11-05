import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';
const BannedMember = sequelize.define('bannedMember', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalBans: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 0,
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bannedBy: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedAt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedUntil: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});
Guild.hasMany(BannedMember, {
    foreignKey: 'guildId',
});
BannedMember.belongsTo(Guild, {
    foreignKey: 'guildId',
});
export default BannedMember;
