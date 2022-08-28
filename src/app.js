import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { logger } from './config.js';

// db connection
import dbConnection from './helper/db.js';
dbConnection();

// Middleware
import verifyToken from './middlewares/verify-token.js';
import { privateRoutes, publicRoutes } from './middlewares/router-bundler.js';

// config
import { env, port } from './config.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

publicRoutes.forEach(route => app.use('/api/v1', route));
privateRoutes.forEach(route => app.use('/api/v1', verifyToken, route));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// general interceptor for all requests
app.use((serverResponse, req, res, next) => {
    const { status, success, message, count, data, credentials } = serverResponse;

    logger.info(serverResponse);

    // Send response to client
    return status !== 200 && !success
        ? next(serverResponse) // if error, pass it to next middleware
        : res
              .status(status || 200)
              .send({ timestamp: new Date(), success, message, count, data, credentials });
});

// error handler
app.use((err, req, res, next) => {
    const { status, success, message, detailed_message } = err;

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = env.development ? err : {};

    return res.status(status || 500).send({ timestamp: new Date(), success, message, detailed_message });
});

app.listen(port, () => {
    console.log(`App listens port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
