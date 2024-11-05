import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
const Guild = sequelize.define('guild', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    welcomeChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    byeChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    welcomeMessage: {
        type: DataTypes.STRING,
        defaultValue: 'Thank you for joining ${member.guild.name}!',
        allowNull: false,
    }
});
export default Guild;
