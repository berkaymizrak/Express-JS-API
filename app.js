const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// db connection
require('./helper/db')();

const indexRouter = require('./routes/index');
const cardsRouter = require('./Structures/Card/routes/cards');
const cardTypesRouter = require('./Structures/CardTypes/routes/card_types');
const usersRouter = require('./Structures/User/routes/users');

const app = express();

// config
const config = require('./config');
app.set('JWT_SECRET', config.JWT_SECRET);

// Middleware
const verifyToken = require('./middleware/verify-token');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', verifyToken);
app.use('/api/cards', cardsRouter);
app.use('/api/card_types', cardTypesRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    return res.json({ status: 'error', message: err.message, detailed_message: err.detailed_message });
});

module.exports = app;
