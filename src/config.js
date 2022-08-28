import dotenv from 'dotenv';

dotenv.config();

const mongoUri = `${process.env.DB_HOST}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?${process.env.DB_CLUSTER_CONFIG}`;

const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS512';
const JWT_REFRESH_ALGORITHM = process.env.JWT_REFRESH_ALGORITHM || 'HS256';

// You may use this as a boolean value for different situations from 'env' object below.
const NODE_ENV = process.env.NODE_ENV || 'development';
const env = {
    development: NODE_ENV === 'development',
    test: NODE_ENV === 'test',
    staging: NODE_ENV === 'staging',
    production: NODE_ENV === 'production',
};
const resultLimit = process.env.RESULT_LIMIT || 10;

import { createLogger, format, transports } from 'winston';
const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
const logFolder = 'logs/';
const logger = createLogger({
    levels: logLevels,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.File({ filename: logFolder + 'all.log' }),
        // new transports.Console()
    ],
    exceptionHandlers: [new transports.File({ filename: logFolder + 'exceptions.log' })],
    rejectionHandlers: [new transports.File({ filename: logFolder + 'rejections.log' })],
});
export { logger, mongoUri, port, JWT_SECRET, JWT_ALGORITHM, JWT_REFRESH_ALGORITHM, env, resultLimit };
