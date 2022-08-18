const mongoose = require('mongoose');

module.exports = () => {
    // mongoose.connect('mongodb://USERNAME:PASSWORD@berkaymizrak.com:2222/nfc_card');
    mongoose.connect('mongodb://localhost/nfc_card');
    mongoose.connection.on('open', () => {
        console.log('MongoDB connection opened');
    }).on('error', (err) => {
        console.log(err);
    }).on('disconnected', () => {
        console.log('MongoDB disconnected');
    }).on('close', () => {
        console.log('MongoDB closed');
    }).on('reconnected', () => {
        console.log('MongoDB reconnected');
    }).on('connected', () => {
        console.log('MongoDB connected');
    });
    // mongoose.Promise = global.Promise;
}
