import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
const User = sequelize.define('user', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    }
});
export default User;
