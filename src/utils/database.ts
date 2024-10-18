import { Sequelize } from 'sequelize';

const database = process.env.DATABASE;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(database, user, password, {
    dialect: 'postgres',
    host: 'localhost',
    logging: false,
});

export default sequelize;