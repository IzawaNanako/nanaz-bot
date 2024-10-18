import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';

const BotSetting = sequelize.define('botSetting', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PresenceUpdateStatus.DoNotDisturb',
    },
    activityType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ActivityType.Watching',
    },
    activityName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'cat videos',
    },
    activityUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

export default BotSetting;