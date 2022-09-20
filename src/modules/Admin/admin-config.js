import AdminJS from 'adminjs';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';
import { bucketName, env, logger, s3Client } from '../../config.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';

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

if (env.production) await adminJs.initialize();
else adminJs.watch();

const logoKey = 'static/images/logo.svg';
if (env.development) {
    adminJs.options.branding.logo = '/' + logoKey;
} else {
    s3Client
        .send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: logoKey,
            })
        )
        .then(data => {
            const url = 'https://' + data.Body.req.host + data.Body.req.path;
            logger.info('Default profile picture path: ' + url);
            adminJs.options.branding.logo = url;
        })
        .catch(error => {
            logger.error('ERROR on getting admin logo path! ', error);
        });
}

export default adminJs;
