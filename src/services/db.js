import mongoose from 'mongoose';
import { logger, mongoUri } from '../config.js';

const dbConnection = async () => {
    const mongooseDb = await mongoose.connect(mongoUri, { useNewUrlParser: true });

    mongoose.connection
        .on('open', () => {
            logger.info('MongoDB connection opened');
        })
        .on('error', error => {
            logger.error(error);
        })
        .on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        })
        .on('close', () => {
            logger.warn('MongoDB closed');
        })
        .on('reconnected', () => {
            logger.info('MongoDB reconnected');
        })
        .on('connected', () => {
            logger.info('MongoDB connected');
        });

    return mongooseDb;
};

export default dbConnection;
