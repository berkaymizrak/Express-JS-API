import dotenv from 'dotenv';

dotenv.config();

const mongoUri = `${process.env.DB_HOST}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?${process.env.DB_CLUSTER_CONFIG}`;

const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;

// You may use this as a boolean value for different situations
const env = {
    development: process.env.NODE_ENV === 'development',
    test: process.env.NODE_ENV === 'test',
    staging: process.env.NODE_ENV === 'staging',
    production: process.env.NODE_ENV === 'production',
};

export { mongoUri, port, JWT_SECRET, env };
