import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';

const GuildMember = sequelize.define('guildMember', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    isKicked: {
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

export default GuildMember;