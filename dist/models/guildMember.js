import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import Guild from './guild.js';
const GuildMember = sequelize.define('guildMember', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    isKicked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});
Guild.hasMany(GuildMember, {
    foreignKey: 'guildId',
});
GuildMember.belongsTo(Guild, {
    foreignKey: 'guildId',
});
export default GuildMember;
