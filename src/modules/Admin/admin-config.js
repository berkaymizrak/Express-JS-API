import AdminJS from 'adminjs';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';
import { bucketName, env, s3Client } from '../../config.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

const logoKey = 'static/images/logo.svg';
if (env.development) {
    adminJs.options.branding.logo = '/' + logoKey;
} else {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: logoKey });
    adminJs.options.branding.logo = await getSignedUrl(s3Client, command);
}

export default adminJs;
