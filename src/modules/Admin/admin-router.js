import AdminJSExpress from '@adminjs/express';
import { userFindQuery } from '../User/user-query.js';
// import adminAuth from '../../middlewares/admin-auth.js';
import { sessionOptions } from '../../config.js';
// import adminJs from './admin-config.js';
import AdminJS from 'adminjs';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';

AdminJS.registerAdapter(AdminJSMongoose);
const mongooseDb = await dbConnection();
// Full doc: https://docs.adminjs.co/tutorial-customizing-resources.html
const adminJs = await new AdminJS({
    databases: [mongooseDb],
    resources: [],
    rootPath: '/api/admin',
    loginPath: '/api/admin/login',
    logoutPath: '/api/admin/logout',
    branding: {
        companyName: 'Express API Admin',
        withMadeWithLove: false,
        logo: '/static/images/logo.svg',
    },
    locale: {
        translations: {
            labels: {
                User: 'Users xx',
                Card: 'Cards xx',
                CardType: 'Card Typesx x',
            },
        },
    },
});

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
    null,
    sessionOptions
);

export default adminRouter;
