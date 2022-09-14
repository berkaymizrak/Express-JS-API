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

export default adminJs;
