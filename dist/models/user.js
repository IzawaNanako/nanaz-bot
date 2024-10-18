import { Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';
const User = sequelize.define('user', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    }
});
export default User;
