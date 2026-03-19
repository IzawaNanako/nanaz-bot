import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database.js';
import { User } from './user.js';

interface ReminderAttributes {
    id: string;
    content: string;
    userId: string;
    when: Date;
    once: boolean;
    dm: boolean;
    channelId: string | null;
}

interface ReminderInstance
    extends Model<ReminderAttributes>,
        ReminderAttributes {
            createdAt?: Date;
            updatedAt?: Date;
        }

const Reminder = sequelize.define<ReminderInstance>('reminder', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    when: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    once: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    dm: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

User.hasMany(Reminder, {
    foreignKey: 'userId',
});
Reminder.belongsTo(User, {
    foreignKey: 'userId',
});

export { Reminder };
