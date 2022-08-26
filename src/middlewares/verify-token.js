import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

module.exports = (req, res, next) => {
    // Express headers are auto converted to lowercase
    const token = req.headers['x-access-token'] || req.body.token || req.query.token;
    let useToken;
    if (token) {
        useToken = token;
    } else {
        const bearerHeader = req.headers.authorization;
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            useToken = bearer[1];
        } else {
            useToken = null;
        }
    }

    if (useToken) {
        jwt.verify(useToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({
                    status: 'error',
                    message: 'Token is not valid',
                    detailed_message: err.message,
                });
            }
            req.decoded = decoded;
            next();
        });
    } else {
        return res.json({
            status: 'error',
            message: 'Auth token is not supplied',
            detailed_message: 'Auth token is not supplied',
        });
    }
};
