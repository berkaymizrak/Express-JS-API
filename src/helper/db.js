import mongoose from 'mongoose';
import { mongoUri } from '../config.js';

const dbConnection = () => {
    mongoose.connect(mongoUri, { useNewUrlParser: true });

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
};

export default dbConnection;
