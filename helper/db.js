const mongoose = require('mongoose');
const config = require('../config');

const {
    db: { host, name, username, password },
} = config;
const connectionString = `mongodb+srv://${username}:${password}@${host}/${name}`;

module.exports = () => {
    mongoose.connect(connectionString);

    mongoose.connection
        .on('open', () => {
            console.log('MongoDB connection opened');
        })
        .on('error', err => {
            console.log(err);
        })
        .on('disconnected', () => {
            console.log('MongoDB disconnected');
        })
        .on('close', () => {
            console.log('MongoDB closed');
        })
        .on('reconnected', () => {
            console.log('MongoDB reconnected');
        })
        .on('connected', () => {
            console.log('MongoDB connected');
        });
    // mongoose.Promise = global.Promise;
};
