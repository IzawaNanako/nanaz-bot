import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database.js';
import { Guild } from './guild.js';

interface BannedMemberAttributes {
    id: string;
    username: string;
    totalBans: number;
    isBanned: boolean;
    bannedBy: string | null;
    bannedReason: string | null;
    bannedAt: Date | null;
    bannedUntil: Date | null;
    guildId: string;
}

interface BannedMemberInstance
    extends Model<BannedMemberAttributes>,
        BannedMemberAttributes {
            createdAt?: Date;
            updatedAt?: Date;
        }

const BannedMember = sequelize.define<BannedMemberInstance>('bannedMember', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalBans: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 0,
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bannedBy: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedAt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bannedUntil: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Guild.hasMany(BannedMember, {
    foreignKey: 'guildId',
});
BannedMember.belongsTo(Guild, {
    foreignKey: 'guildId',
});

export { BannedMember };