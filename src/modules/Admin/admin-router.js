import AdminJSExpress from '@adminjs/express';
import { userFindQuery } from '../User/user-query.js';
import adminAuth from '../../middlewares/admin-auth.js';
import { sessionOptions } from '../../config.js';
import adminJs from './admin-config.js';

const adminRouter = await AdminJSExpress.buildAuthenticatedRouter(
    await adminJs,
    {
        authenticate: async (email, password) => {
            const filters = { email };
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
        },
    },
    adminAuth,
    sessionOptions
);

export default adminRouter;
