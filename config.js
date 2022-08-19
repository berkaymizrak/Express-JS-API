const dotenv = require('dotenv');

dotenv.config()

module.exports = {
    JWT_SECRET: 'secret',
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'db',
    }
}