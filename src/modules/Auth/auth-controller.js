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
        await userFindQuery(res, req.query, { filters, limit: 1 })
            .then(async responseFindQuery => {
                if (!responseFindQuery.success && responseFindQuery.status !== 200) return responseFindQuery;
                if (responseFindQuery.data.length > 0) {
                    return {
                        status: 409,
                        success: false,
                        mes: res.__('user_already_exists'),
                    };
                } else {
                    return await userCreateQuery(res, req.body).then(responseCreateQuery => {
                        responseCreateQuery['credentials'] = createCredentials(req.body);
                        return responseCreateQuery;
                    });
                }
            })
            .catch(error => {
                return { mes: res.__('error_creating_module', { module: res.__('user') }), error };
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
                await userFindQuery(res, req.query, { filters, projection, limit: 1 }).then(
                    async responseFindQuery => {
                        if (!responseFindQuery.success && responseFindQuery.status !== 200)
                            return next(responseFindQuery);
                        if (responseFindQuery.data.length > 0) {
                            const responseData = responseFindQuery.data[0];
                            return await responseData.comparePassword(password).then(async isMatch => {
                                if (isMatch.success) {
                                    responseData.password = undefined;
                                    return {
                                        status: 200,
                                        success: true,
                                        mes: res.__('login_success'),
                                        data: responseData,
                                        credentials: createCredentials(responseData),
                                    };
                                } else {
                                    return {
                                        status: 401,
                                        success: false,
                                        mes: res.__('invalid_credentials'),
                                    };
                                }
                            });
                        } else {
                            return {
                                status: 401,
                                success: false,
                                mes: res.__('invalid_credentials'),
                            };
                        }
                    }
                )
            );
        })
        .catch(error => {
            return { mes: res.__('error_logging_in'), error };
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

            return await userFindQuery(res, req.query, { filters, limit: 1 }).then(
                async responseFindQuery => {
                    if (!responseFindQuery.success) {
                        return next(responseFindQuery);
                    }
                    if (!responseFindQuery.count) {
                        return next({
                            status: 200,
                            success: false,
                            mes: res.__('module_not_found', { module: res.__('User') }),
                        });
                    }

                    const user = responseFindQuery.data[0];
                    const userId = user._id;
                    const filters = { userId };
                    await tokenDeleteQuery(res, filters);

                    let token = crypto.randomBytes(32).toString('hex');

                    await tokenCreateQuery(res, {
                        userId,
                        token,
                    });

                    const link = `${frontendUrl}/reset_password_confirm?token=${token}&userId=${userId}`;
                    const mailPayload = {
                        fullName: `${user.firstName} ${user.lastName}`,
                        link,
                    };
                    return next(
                        await sendMailTemplate(
                            user.email,
                            res.__('reset_password_request'),
                            'resetPasswordRequest',
                            mailPayload
                        )
                    );
                }
            );
        })
        .catch(error => {
            return next({ mes: res.__('error_resetting_password'), error });
        });
};

const resetPasswordConfirm = async (req, res, next) => {
    const { token, userId } = req.query;
    const filters = { token, userId };
    return await tokenFindQuery(res, req.query, { filters, limit: 1 })
        .then(async responseFindQuery => {
            if (!responseFindQuery.success) {
                return next(responseFindQuery);
            }
            if (!responseFindQuery.count) {
                return next({
                    status: 200,
                    success: false,
                    mes: res.__('module_not_found', { module: res.__('Token') }),
                });
            }
            await userFindQuery(res, req.query, { filters: { _id: userId }, limit: 1 }).then(
                async responseUserFindQuery => {
                    if (!responseUserFindQuery.success) return next(responseUserFindQuery);
                    if (!responseUserFindQuery.count) {
                        return next({
                            status: 200,
                            success: false,
                            mes: res.__('module_not_found', { module: res.__('User') }),
                        });
                    }
                    return next({
                        status: 200,
                        success: true,
                        mes: res.__('valid_token'),
                    });
                }
            );
        })
        .catch(error => {
            return next({ mes: res.__('error_resetting_password'), error });
        });
};

const resetPasswordDone = async (req, res, next) => {
    const { token, userId } = req.query;
    const { password } = req.body;
    const errorMessage = res.__('expired_token');

    const tokenFilters = { userId };
    return await tokenFindQuery(res, req.query, { filters: tokenFilters, limit: 1 })
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

            if (!env.development) await tokenDeleteQuery(res, tokenFilters);

            return await userUpdateQuery(res, { _id: userId }, { password }).then(
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
                            res.__('password_reset_success'),
                            'resetPasswordDone',
                            mailPayload
                        )
                    );
                }
            );
        })
        .catch(error => {
            return next({ mes: res.__('error_resetting_password'), error });
        });
};

const listTokens = async (req, res, next) => {
    return next(await tokenFindQuery(res, req.query, {}));
};

export {
    signupController,
    loginUser,
    resetPasswordRequest,
    resetPasswordConfirm,
    resetPasswordDone,
    listTokens,
};
