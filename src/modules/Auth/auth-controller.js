import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ALGORITHM, JWT_REFRESH_ALGORITHM, frontendUrl, env } from '../../config.js';
import { userCreateQuery, userFindQuery, userUpdateQuery } from '../User/user-query.js';
import { sendMailTemplate } from '../../services/sendMail.js';
import isEmailValid from '../../services/emailValidator.js';
import { tokenCreateQuery, tokenDeleteQuery, tokenFindQuery } from './token-query.js';
import crypto from 'crypto';

function createToken({ username, role, _id }, algorithm, expiresIn) {
    const payload = {
        username,
        role,
        _id,
    };
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: algorithm,
        expiresIn: expiresIn,
    });
}

function createCredentials(user) {
    return {
        tokenType: 'Bearer',
        accessToken: createToken(user, JWT_ALGORITHM, '6h'),
        refreshToken: createToken(user, JWT_REFRESH_ALGORITHM, '1d'),
    };
}

const signupController = async (req, res, next) => {
    const { username, email } = req.body;

    const filters = { $or: [{ username }, { email }] };
    return next(
        await userFindQuery(req.query, { filters, limit: 1 })
            .then(async responseFindQuery => {
                if (!responseFindQuery.success && responseFindQuery.status !== 200) return responseFindQuery;
                if (responseFindQuery.data.length > 0) {
                    return {
                        status: 409,
                        success: false,
                        mes: 'Username or Email already exists',
                    };
                } else {
                    return await userCreateQuery(req.body).then(responseCreateQuery => {
                        responseCreateQuery['credentials'] = createCredentials(req.body);
                        return responseCreateQuery;
                    });
                }
            })
            .catch(err => {
                return { mes: 'Error creating user', err };
            })
    );
};

const loginUser = async (req, res, next) => {
    const { usernameOrEmail, password } = req.body;

    return await isEmailValid(usernameOrEmail)
        .then(async isEmail => {
            const filters = {};
            if (isEmail) {
                filters.email = usernameOrEmail;
            } else {
                filters.username = usernameOrEmail;
            }
            const projection = { __v: 0 };
            return next(
                await userFindQuery(req.query, { filters, projection, limit: 1 }).then(
                    async responseFindQuery => {
                        if (!responseFindQuery.success && responseFindQuery.status !== 200)
                            return next(responseFindQuery);
                        if (responseFindQuery.data.length > 0) {
                            const responseData = responseFindQuery.data[0];
                            return await responseData.comparePassword(password).then(async isMatch => {
                                if (isMatch) {
                                    responseData.password = undefined;
                                    return {
                                        status: 200,
                                        success: true,
                                        mes: 'User logged in successfully',
                                        data: responseData,
                                        credentials: createCredentials(responseData),
                                    };
                                } else {
                                    return {
                                        status: 401,
                                        success: false,
                                        mes: 'Incorrect password',
                                    };
                                }
                            });
                        } else {
                            return {
                                status: 401,
                                success: false,
                                mes: 'Incorrect Password or Username',
                            };
                        }
                    }
                )
            );
        })
        .catch(err => {
            return { mes: 'Error logging in user', err };
        });
};

const resetPasswordRequest = async (req, res, next) => {
    const { usernameOrEmail } = req.body;
    return await isEmailValid(usernameOrEmail)
        .then(async isEmail => {
            const filters = {};
            if (isEmail) {
                filters.email = usernameOrEmail;
            } else {
                filters.username = usernameOrEmail;
            }

            return await userFindQuery(req.query, { filters, limit: 1 }).then(async responseFindQuery => {
                if (!responseFindQuery.success) {
                    return next(responseFindQuery);
                }
                if (!responseFindQuery.count) {
                    return next({
                        status: 200,
                        success: false,
                        mes: 'User not found',
                    });
                }

                const user = responseFindQuery.data[0];
                const userId = user._id;
                const filters = { userId };
                await tokenDeleteQuery(filters);

                let token = crypto.randomBytes(32).toString('hex');

                await tokenCreateQuery({
                    userId,
                    token,
                });

                const link = `${frontendUrl}reset_password_confirm?token=${token}&userId=${userId}`;
                const mailPayload = {
                    fullName: `${user.firstName} ${user.lastName}`,
                    link,
                };
                return next(
                    await sendMailTemplate(
                        user.email,
                        'Reset Password Request',
                        'resetPasswordRequest',
                        mailPayload
                    )
                );
            });
        })
        .catch(err => {
            return next({ mes: 'Error requesting password reset', err });
        });
};

const resetPasswordConfirm = async (req, res, next) => {
    const { token, userId } = req.query;
    const filters = { token, userId };
    return await tokenFindQuery(req.query, { filters, limit: 1 })
        .then(async responseFindQuery => {
            if (!responseFindQuery.success) {
                return next(responseFindQuery);
            }
            if (!responseFindQuery.count) {
                return next({
                    status: 200,
                    success: false,
                    mes: 'Token not found',
                });
            }
            await userFindQuery(req.query, { filters: { _id: userId }, limit: 1 }).then(
                async responseUserFindQuery => {
                    if (!responseUserFindQuery.success) return next(responseUserFindQuery);
                    if (!responseUserFindQuery.count) {
                        return next({
                            status: 200,
                            success: false,
                            mes: 'User not found',
                        });
                    }
                    return next({
                        status: 200,
                        success: true,
                        mes: 'Token is valid',
                    });
                }
            );
        })
        .catch(err => {
            return next({ mes: 'Error confirming reset password', err });
        });
};

const resetPasswordDone = async (req, res, next) => {
    const { token, userId } = req.query;
    const { password } = req.body;
    const errorMessage = 'Invalid or expired password reset token';

    const tokenFilters = { userId };
    return await tokenFindQuery(req.query, { filters: tokenFilters, limit: 1 })
        .then(async responseTokenFindQuery => {
            if (!responseTokenFindQuery.success || !responseTokenFindQuery.count) {
                responseTokenFindQuery = {
                    ...responseTokenFindQuery,
                    status: 401,
                    success: false,
                    mes: errorMessage,
                };
                return next(responseTokenFindQuery);
            }

            if (token !== responseTokenFindQuery.data[0].token) {
                return next({
                    status: 401,
                    success: false,
                    mes: errorMessage,
                });
            }

            if (!env.development) await tokenDeleteQuery(tokenFilters);

            return await userUpdateQuery({ _id: userId }, { password }).then(
                async responseUserUpdateQuery => {
                    if (!responseUserUpdateQuery.success) return next(responseUserUpdateQuery);

                    const user = responseUserUpdateQuery.data;

                    const link = `${frontendUrl}`;
                    const mailPayload = {
                        fullName: `${user.firstName} ${user.lastName}`,
                        link,
                    };
                    return next(
                        await sendMailTemplate(
                            user.email,
                            'Reset Password Successfully',
                            'resetPasswordDone',
                            mailPayload
                        )
                    );
                }
            );
        })
        .catch(err => {
            return next({ mes: 'Error resetting password', err });
        });
};

const listTokens = async (req, res, next) => {
    return next(await tokenFindQuery(req.query, {}));
};

export {
    signupController,
    loginUser,
    resetPasswordRequest,
    resetPasswordConfirm,
    resetPasswordDone,
    listTokens,
};
