import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const verifyToken = async (req, res, next) => {
    // Express headers are auto converted to lowercase
    const token = req.headers['x-access-token'] || req.body.token || req.query.token;

    let useToken;
    if (token) {
        useToken = token;
    } else {
        const bearerHeader = req.headers.authorization;
        if (bearerHeader) {
            useToken = bearerHeader?.split(' ')[1];
        } else {
            useToken = null;
        }
    }

    if (useToken) {
        await jwt.verify(useToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                return next({
                    status: 401,
                    success: false,
                    message: 'Token is not valid',
                    detailed_message: err.message,
                });
            } else {
                req.decoded = decoded;
                return next();
            }
        });
    } else {
        return next({
            status: 401,
            success: false,
            message: 'Auth token is not supplied',
        });
    }
};

export default verifyToken;
