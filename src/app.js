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

const createPaging = (req, total_count) => {
    // Set pagination urls
    // Calculated req.query params are set in pagination-params.js
    const { current_page_number, previous_page_number, next_page_number, limit } = req.query;

    const max_page_number = Math.ceil(total_count / limit);
    const basePage = req.protocol + '://' + req.get('host') + req.path;
    const page = basePage + '?page=' + current_page_number + '&limit=' + limit;

    const first_page = basePage + '?page=1&limit=' + limit;
    const last_page = basePage + '?page=' + max_page_number + '&limit=' + limit;

    let next_page = max_page_number > current_page_number ? basePage + '?page=' + next_page_number : null;
    if (next_page) next_page = next_page + '&limit=' + limit;

    let previous_page = current_page_number > 1 ? basePage + '?page=' + previous_page_number : null;
    if (previous_page) previous_page = previous_page + '&limit=' + limit;

    const number = { current_page_number, previous_page_number, next_page_number, max_page_number };

    return {
        first_page,
        previous_page,
        page,
        next_page,
        last_page,
        number,
    };
};

// general interceptor for all requests
app.use((serverResponse, req, res, next) => {
    const { status, success, message, total_count, count, data, credentials } = serverResponse;

    logger.info(serverResponse);

    const paging = createPaging(req, total_count);

    // Send response to client
    return status !== 200 && !success
        ? next(serverResponse) // if error, pass it to next middleware
        : res.status(status || 200).send({
              // general response
              timestamp: new Date(),
              success,
              message,

              // pagination
              paging,

              // data
              total_count,
              count,
              data,

              // authentication
              credentials,
          });
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
