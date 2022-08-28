import bcrypt from 'bcryptjs';
import User from '../User/user-model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ALGORITHM, JWT_REFRESH_ALGORITHM } from '../../config.js';
import { userCreateQuery, userFindQuery } from '../User/user-query.js';

function createToken(username, algorithm, expiresIn) {
    const payload = {
        username,
    };
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: algorithm,
        expiresIn: expiresIn,
    });
}

function createCredentials(username) {
    return {
        tokenType: 'Bearer',
        accessToken: createToken(username, JWT_ALGORITHM, '6h'),
        refreshToken: createToken(username, JWT_REFRESH_ALGORITHM, '1d'),
    };
}

const createUser = async (req, res, next) => {
    const { username, email } = req.body;

    const filters = { $or: [{ username }, { email }] };
    return await userFindQuery(filters, null, null, 1)
        .then(async responseFindQuery => {
            if (!responseFindQuery.success && responseFindQuery.status !== 200)
                return next(responseFindQuery);
            if (responseFindQuery.data.length > 0) {
                return next({
                    status: 409,
                    success: false,
                    message: 'Username or Email already exists',
                });
            } else {
                return await userCreateQuery(req.body)
                    .then(responseCreateQuery => {
                        responseCreateQuery['credentials'] = createCredentials(username);
                        return next(responseCreateQuery);
                    })
                    .catch(err => {
                        return next({
                            status: 500,
                            success: false,
                            message: 'Error creating user',
                            detailed_message: err.message,
                        });
                    });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error creating user',
                detailed_message: err.message,
            });
        });
};

const loginUser = async (req, res, next) => {
    const { username, password } = req.body;
    return await userFindQuery({ username }, { __v: 0 }, null, 1)
        .then(async responseFindQuery => {
            if (!responseFindQuery.success && responseFindQuery.status !== 200)
                return next(responseFindQuery);
            if (responseFindQuery.data.length > 0) {
                const responseData = responseFindQuery.data[0];
                bcrypt.compare(password, responseData.password, (err, result) => {
                    if (err)
                        return next({
                            status: 500,
                            success: false,
                            message: 'Error comparing password',
                            detailed_message: err.message,
                        });
                    if (!result)
                        return next({
                            status: 401,
                            success: false,
                            message: 'Incorrect Password or Username',
                        });

                    responseData.password = undefined;
                    return next({
                        status: 200,
                        success: true,
                        message: 'User logged in successfully',
                        data: responseData,
                        credentials: createCredentials(username),
                    });
                });
            } else {
                return next({
                    status: 401,
                    success: false,
                    message: 'Incorrect Password or Username',
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error logging in user',
                detailed_message: err.message,
            });
        });
};

export { createUser, loginUser };
