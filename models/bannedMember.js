const Sequelize = require('sequelize');
const sequelize = require('../utils/database.js');
const Guild = require('./guild.js');

const BannedMember = sequelize.define('bannedMember', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    bans: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    banned: {
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

module.exports = BannedMember;