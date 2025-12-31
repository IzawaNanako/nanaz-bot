import { Sequelize } from 'sequelize';

const database = process.env.DATABASE;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;

if (!database || !user || !password) {
    console.error('Database credentials not found.');
    process.exit(1);
}

/**
 * The database connection.
 */
export const sequelize = new Sequelize(database, user, password, {
    dialect: 'postgres',
    host: host, 
    port: 5432,
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});
