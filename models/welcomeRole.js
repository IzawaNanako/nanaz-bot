const Sequelize = require('sequelize');
const sequelize = require('../utils/database.js');
const Guild = require('./guild.js');

const WelcomeRole = sequelize.define('welcomeRole', {
    roleId: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

Guild.hasMany(WelcomeRole, {
    foreignKey: 'guildId',
});
WelcomeRole.belongsTo(Guild, {
    foreignKey: 'guildId',
});

module.exports = WelcomeRole;