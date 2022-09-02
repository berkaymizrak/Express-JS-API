import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ALGORITHM, JWT_REFRESH_ALGORITHM, frontendUrl, env } from '../../config.js';
import { userCreateQuery, userFindQuery, userUpdateQuery } from '../User/user-query.js';
import { sendMailPayload, sendMailTemplete } from '../../services/sendMail.js';
import { tokenCreateQuery, tokenDeleteQuery, tokenFindQuery } from './token-query.js';
import crypto from 'crypto';

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
    return await userFindQuery(req.query, { filters, limit: 1 })
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
    const filters = { username };
    const projection = { __v: 0 };
    return await userFindQuery(req.query, { filters, projection, limit: 1 })
        .then(responseFindQuery => {
            if (!responseFindQuery.success && responseFindQuery.status !== 200)
                return next(responseFindQuery);
            if (responseFindQuery.data.length > 0) {
                const responseData = responseFindQuery.data[0];
                return responseData.comparePassword(password, (err, isMatch) => {
                    if (err) {
                        return next({
                            status: 500,
                            success: false,
                            message: 'Error logging in',
                            detailed_message: err.message,
                        });
                    }
                    if (isMatch) {
                        responseData.password = undefined;
                        return next({
                            status: 200,
                            success: true,
                            message: 'User logged in successfully',
                            data: responseData,
                            credentials: createCredentials(username),
                        });
                    } else {
                        return next({
                            status: 401,
                            success: false,
                            message: 'Incorrect password',
                        });
                    }
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

const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;
    const filters = { email };
    return await userFindQuery(req.query, { filters, limit: 1 }).then(async responseFindQuery => {
        if (!responseFindQuery.success) {
            return next(responseFindQuery);
        }
        if (!responseFindQuery.count) {
            return next({
                status: 200,
                success: false,
                message: 'User not found',
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

        const link = `${frontendUrl}/reset_password?token=${token}&userId=${userId}`;
        const mailMessageText = `Dear ${user.firstName}, Click the link to reset your password: ${link}`;
        const mailMessageHtml = `
                    <h1>Password Reset</h1>
                    <p>
                        Dear ${user.firstName},
                    </p>
                    <p>
                        You have requested to reset your password.
                    </p>
                    <p>
                        <a href="${link}" target='_blank'>Click here to reset your password</a>
                    </p>
                `;

        return next(
            await sendMailPayload(
                user.email,
                'Reset Password Request',
                mailMessageText,
                mailMessageHtml
                // { name: user.name, link: link },
                // '../template/requestResetPassword.handlebars'
            )
        );
    });
};

const resetPasswordConfirm = async (req, res, next) => {
    const { token, userId } = req.query;
    const filters = { token, userId };
    return await tokenFindQuery(req.query, { filters, limit: 1 }).then(async responseFindQuery => {
        if (!responseFindQuery.success) {
            return next(responseFindQuery);
        }
        if (!responseFindQuery.count) {
            return next({
                status: 200,
                success: false,
                message: 'Token not found',
            });
        }
        await userFindQuery(req.query, { filters: { _id: userId }, limit: 1 }).then(
            async responseUserFindQuery => {
                if (!responseUserFindQuery.success) return next(responseUserFindQuery);
                if (!responseUserFindQuery.count) {
                    return next({
                        status: 200,
                        success: false,
                        message: 'User not found',
                    });
                }
                return next({
                    status: 200,
                    success: true,
                    message: 'Token is valid',
                });
            }
        );
    });
};

const resetPassword = async (req, res, next) => {
    const { token, userId } = req.query;
    const { password } = req.body;
    const errorMessage = 'Invalid or expired password reset token';

    const tokenFilters = { userId };
    return await tokenFindQuery(req.query, { filters: tokenFilters, limit: 1 }).then(
        async responseTokenFindQuery => {
            if (!responseTokenFindQuery.success || !responseTokenFindQuery.count) {
                responseTokenFindQuery = {
                    ...responseTokenFindQuery,
                    status: 401,
                    success: false,
                    message: errorMessage,
                };
                return next(responseTokenFindQuery);
            }

            if (token !== responseTokenFindQuery.data[0].token) {
                return next({
                    status: 401,
                    success: false,
                    message: errorMessage,
                });
            }

            if (!env.development) await tokenDeleteQuery(tokenFilters);

            return await userUpdateQuery({ _id: userId }, { password }).then(
                async responseUserUpdateQuery => {
                    if (!responseUserUpdateQuery.success) return next(responseUserUpdateQuery);

                    const user = responseUserUpdateQuery.data;

                    return next(
                        await sendMailPayload(
                            user.email,
                            'Password Reset Successfully',
                            `Dear ${user.firstName},
                            Your password has been reset successfully.
                            \nYou can now login with your new password.`
                            // {
                            //     name: user.name,
                            // },
                            // './template/resetPassword.handlebars'
                        )
                    );
                }
            );
        }
    );
};

const listTokens = async (req, res, next) => {
    return next(await tokenFindQuery(req.query, {}));
};

export { createUser, loginUser, requestPasswordReset, resetPasswordConfirm, resetPassword, listTokens };
