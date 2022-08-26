import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// db connection
import dbConnection from './helper/db.js';
dbConnection();

// Middleware
import verifyToken from './middlewares/verify-token.js';
import { privateRoutes, publicRoutes } from './middlewares/router-bundler.js';

// config
import { env, port } from './config.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

publicRoutes.forEach(route => app.use('/api/v1', route));
privateRoutes.forEach(route => app.use('/api/v1', verifyToken, route));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = env.development ? err : {};

    // render the error page
    res.status(err.status || 500);
    return res.json({ success: err.success, message: err.message, detailed_message: err.detailed_message });
});

app.listen(port, () => {
    console.log(`App listens port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
