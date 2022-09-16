import AdminJSExpress from '@adminjs/express';
import { userFindQuery } from '../User/user-query.js';
import adminAuth from '../../middlewares/admin-auth.js';
import { sessionOptions, cookiePassword, logger } from '../../config.js';
import adminJs from './admin-config.js';
import isEmailValid from '../../services/emailValidator.js';

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
        authenticate: async (usernameOrEmail, password) => {
            return await isEmailValid(usernameOrEmail)
                .then(async isEmail => {
                    const filters = {};
                    if (isEmail) {
                        filters.email = usernameOrEmail;
                    } else {
                        filters.username = usernameOrEmail;
                    }

                    return await userFindQuery({}, { filters, limit: 1, projection: {} }).then(
                        async responseUserFindQuery => {
                            const { data } = responseUserFindQuery;
                            if (
                                responseUserFindQuery.success &&
                                data &&
                                data.length > 0 &&
                                data[0].schema.methods.isAdmin(data[0].role)
                            ) {
                                const user = data[0];

                                return await user.comparePassword(password).then(async isMatch => {
                                    if (isMatch.success) {
                                        return user;
                                    }
                                });
                            }
                        }
                    );
                })
                .catch(error => {
                    logger.error('Admin login error:', error);
                    return;
                });
        },
        cookiePassword,
    },
    adminAuth,
    sessionOptions
);

export default adminRouter;
