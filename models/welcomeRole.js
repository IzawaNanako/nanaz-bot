const Sequelize = require('sequelize');
const sequelize = require('../utils/database.js');
const Guild = require('./guild.js');

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

module.exports = WelcomeRole;