import mongoose from 'mongoose';
import { logger, mongoUri } from '../config.js';

const dbConnection = () => {
    mongoose.connect(mongoUri, { useNewUrlParser: true });

    mongoose.connection
        .on('open', () => {
            logger.info('MongoDB connection opened');
        })
        .on('error', err => {
            logger.error(err);
        })
        .on('disconnected', () => {
            logger.warning('MongoDB disconnected');
        })
        .on('close', () => {
            logger.warning('MongoDB closed');
        })
        .on('reconnected', () => {
            logger.info('MongoDB reconnected');
        })
        .on('connected', () => {
            logger.info('MongoDB connected');
        });
};

export default dbConnection;
