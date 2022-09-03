import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSMongoose from '@adminjs/mongoose';
import dbConnection from '../../services/db.js';

// adminRouter.get('/admin', adminFunc);

AdminJS.registerAdapter(AdminJSMongoose);

const mongooseDb = await dbConnection();

// Full doc: https://docs.adminjs.co/tutorial-customizing-resources.html
// Passing resources by giving entire database
const adminJs = new AdminJS({
    databases: [mongooseDb],
    rootPath: '/api/v1/admin',
});

/*// Passing resources one by one,
// also with an additional options for admin resource
const adminJs = new AdminJS({
    resources: [User, {
        resource: Admin,
        options: {
            //...
        },
    }],
})*/

const adminRouter = AdminJSExpress.buildRouter(adminJs);

export default adminRouter;
