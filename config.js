const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'db',
    },
    // You may use this as a boolean value for different situations
    env: {
        development: process.env.NODE_ENV === 'development',
        test: process.env.NODE_ENV === 'test',
        staging: process.env.NODE_ENV === 'staging',
        production: process.env.NODE_ENV === 'production',
    },
};
