import AdminJS from 'adminjs';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';
import { bucketParams, env, logger, s3 } from '../../config.js';

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

bucketParams.Key = 'static/images/logo.svg';
if (env.development) {
    adminJs.options.branding.logo = '/' + bucketParams.Key;
} else {
    s3.getSignedUrl('getObject', bucketParams, (err, url) => {
        if (err) {
            logger.error('AWS Fetch Error:', err);
        } else {
            adminJs.options.branding.logo = url;
        }
    });
}

export default adminJs;
