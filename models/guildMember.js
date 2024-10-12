const Sequelize = require('sequelize');
const sequelize = require('../utils/database.js');
const Guild = require('./guild.js');

const GuildMember = sequelize.define('guildMember', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    kicked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

Guild.hasMany(GuildMember, {
    foreignKey: 'guildId',
});
GuildMember.belongsTo(Guild, {
    foreignKey: 'guildId',
});

module.exports = GuildMember;