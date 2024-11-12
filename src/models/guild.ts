import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

interface GuildAttributes {
    id: string;
    welcomeChannelId: string | null;
    byeChannelId: string | null;
    logChannelId: string | null;
    welcomeMessage: string | null;
    language: string;
}

interface GuildInstance
    extends Model<GuildAttributes>,
        GuildAttributes {
            createdAt?: Date;
            updatedAt?: Date;
        }

const Guild = sequelize.define<GuildInstance>('guild', {
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
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'en-US',
        allowNull: false,
    }
});

export default Guild;