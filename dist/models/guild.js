import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';
const Guild = sequelize.define('guild', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    welcomeChannelId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    byeChannelId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    logChannelId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    welcomeMessage: {
        type: Sequelize.STRING,
        defaultValue: 'Thank you for joining ${member.guild.name}!',
        allowNull: false,
    }
});
export default Guild;
