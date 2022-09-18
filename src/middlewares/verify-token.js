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
        }
    }

    if (useToken) {
        return next(
            await jwt.verify(useToken, JWT_SECRET, (error, decoded) => {
                if (error) {
                    req.session.user = null;
                    return {
                        status: 401,
                        success: false,
                        mes: res.__('token_not_valid'),
                        error,
                    };
                } else {
                    req.session.user = decoded;
                    return;
                }
            })
        );
    } else {
        req.session.user = null;
        return next({
            status: 401,
            success: false,
            mes: res.__('no_auth_token'),
        });
    }
};

export default verifyToken;
