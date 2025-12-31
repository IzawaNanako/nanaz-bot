import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database.js';

interface UserAttributes {
    id: string;
    language: string;
    // New Stats Columns
    rpsWins: number;
    rpsLosses: number;
    rpsDraws: number;
    tttWins: number;
    tttLosses: number;
    tttDraws: number;
    coinFlipWins: number;
    coinFlipLosses: number;
}

interface UserInstance
    extends Model<UserAttributes>,
        UserAttributes {
            createdAt: Date;
            updatedAt: Date;
        }

const User = sequelize.define<UserInstance>('user', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en-US',
        allowNull: false,
    },
    rpsWins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    rpsLosses: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    rpsDraws: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    tttWins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    tttLosses: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    tttDraws: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    coinFlipWins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    coinFlipLosses: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

export { User };
