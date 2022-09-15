import dotenv from 'dotenv';
import crypto from 'crypto';
import MongoStore from 'connect-mongo';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Use MONGODB_URI OR detailed MongoDB configuration
const mongoUri =
    process.env.MONGODB_URI ||
    `${process.env.DB_HOST}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?${process.env.DB_CLUSTER_CONFIG}`;

const mailService = process.env.MAIL_SERVICE;
const mailAuth = {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
};
const fromEmail = process.env.FROM_EMAIL;

const port = process.env.PORT || 3001;
const apiUrl = process.env.API_URL || 'http://localhost:3001';
// FRONTEND_URL ends with a slash
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001/';
const sessionSecret = process.env.SESSION_SECRET || 'secret';
const cookiePassword = process.env.COOKIE_PASSWORD || 'secret';
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

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
const logFolder = 'logs/';
let exceptionHandlers = [];
let rejectionHandlers = [];
let transportsHandlers = [];
if (env.development) {
    exceptionHandlers.push(new transports.File({ filename: logFolder + 'exceptions.log' }));
    rejectionHandlers.push(new transports.File({ filename: logFolder + 'rejections.log' }));
    transportsHandlers.push(new transports.File({ filename: logFolder + 'all.log' }));
} else {
    transportsHandlers.push(new transports.Console());
}
const logger = createLogger({
    levels: logLevels,
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
    transports: transportsHandlers,
    exceptionHandlers,
    rejectionHandlers,
});

function genuuid() {
    return crypto.randomBytes(32).toString('hex');
}
const sessionOptions = {
    genid: genuuid,
    secret: sessionSecret,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: MongoStore.create({
        mongoUrl: mongoUri,
        ttl: 14 * 24 * 60 * 60, // = 14 days (Default: 14 days)
        autoRemove: 'interval', // automatically remove expired sessions. Options: native, interval, disabled (Default: 'native')
        autoRemoveInterval: 360, // In minutes (Default: 10)
        touchAfter: 24 * 3600, // time period in seconds (Default: 24 hours),
        crypto: {
            secret: cookiePassword,
        },
    }),
    cookie: {
        maxAge: 60000, // Default: null
    },
    rolling: true, // forces resetting of max age
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export {
    logger,
    mongoUri,
    mailService,
    mailAuth,
    fromEmail,
    port,
    apiUrl,
    frontendUrl,
    JWT_SECRET,
    JWT_ALGORITHM,
    JWT_REFRESH_ALGORITHM,
    env,
    resultLimit,
    cookiePassword,
    sessionOptions,
    __dirname,
};
