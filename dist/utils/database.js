import { Sequelize } from 'sequelize';
const database = process.env.DATABASE;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
if (!database || !user || !password) {
    console.error('Database credentials not found.');
    process.exit(1);
}
const sequelize = new Sequelize(database, user, password, {
    dialect: 'postgres',
    host: 'localhost',
    logging: false,
});
export default sequelize;
