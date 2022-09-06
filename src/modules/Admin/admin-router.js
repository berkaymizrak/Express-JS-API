import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';
import express from 'express';
import { sessionOptions } from '../../config.js';
import { userFindQuery } from '../User/user-query.js';

AdminJS.registerAdapter(AdminJSMongoose);

const mongooseDb = await dbConnection();

// Full doc: https://docs.adminjs.co/tutorial-customizing-resources.html
const adminJs = new AdminJS({
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

const authRouter = express.Router();
authRouter.use((req, res, next) => {
    if (req.session && req.session.adminUser) {
        if (req.path === '/login') {
            return res.redirect(adminJs.options.rootPath);
        } else {
            return next();
        }
    } else {
        if (req.path === '/login') {
            return next();
        } else {
            return res.redirect(adminJs.options.loginPath);
        }
    }
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
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
    authRouter,
    sessionOptions
);

export default adminRouter;
