import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

interface UserAttributes {
    id: string;
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
    }
});

export default User;