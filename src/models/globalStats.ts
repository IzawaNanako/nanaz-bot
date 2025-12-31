import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database.js';

interface GlobalStatsAttributes {
    id: string;
    totalTranslations: number;
    totalReplies: number;
}

interface GlobalStatsInstance
    extends Model<GlobalStatsAttributes>,
        GlobalStatsAttributes {
            createdAt?: Date;
            updatedAt?: Date;
        }

const GlobalStats = sequelize.define<GlobalStatsInstance>('globalStats', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    totalTranslations: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    totalReplies: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

export { GlobalStats };
