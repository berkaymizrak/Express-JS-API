import createError from 'http-errors';
import express from 'express';
// import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// config
import { port, logger, env } from './config.js';

// services
import createPaging from './services/createPaging.js';

// Middlewares
import middleWares from './middlewares/middleWareHandler.js';
import verifyToken from './middlewares/verify-token.js';
import { adminRoutes, privateRoutes, publicRoutes } from './middlewares/router-bundler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runServer = async () => {
    const app = express();

    if (env.production) {
        app.set('trust proxy', 1); // trust first proxy
        sessionOptions.cookie.secure = true; // serve secure cookies
    }
    // app.use(session(sessionOptions));

    // DB connection is done in admin-router.js > admin-config.js
    adminRoutes.forEach(route => app.use('/api/admin', route));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    // app.use(cookieParser());

    app.use('/static', express.static(path.join(__dirname, 'static')));

    middleWares.forEach(middleware => app.use(middleware));
    publicRoutes.forEach(route => app.use('/api/v1', route));
    privateRoutes.forEach(route => app.use('/api/v1', verifyToken, route));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // general interceptor for all requests
    app.use((serverResponse, req, res, next) => {
        const { status, success, mes, totalCount, count, data, credentials } = serverResponse;

        logger.info(serverResponse);

        const paging = createPaging(req, totalCount);

        // Send response to client
        return status !== 200 && !success
            ? next(serverResponse) // if error, pass it to next middleware
            : res.status(status || 200).send({
                  // general response
                  timestamp: new Date(),
                  success,
                  message: mes,

                  // pagination
                  paging,

                  // data
                  totalCount,
                  count,
                  data,

                  // authentication
                  credentials,
              });
    });

    // error handler
    app.use((error, req, res, next) => {
        logger.error(error);
        const { status, mes, err } = error;
        let { success } = error;
        if (!success) success = false;
        let err_message;
        if (err) err_message = err.message;

        // set locals, only providing error in development
        // res.locals.message = err.message;
        // res.locals.error = env.development ? err : {};

        return res
            .status(status || 500)
            .send({ timestamp: new Date(), success, message: mes, detailed_message: err_message });
    });

    app.listen(port, () => {
        console.log(`App listens port ${port}`);
    });

    process.on('unhandledRejection', err => {
        console.log('UNHANDLED REJECTION! Shutting down...');
        console.log(err.name, err.message);
        logger.error(err.name, err.message);
        process.exit(1);
    });
};

runServer();

export { __dirname };
