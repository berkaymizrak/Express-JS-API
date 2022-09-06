import express from 'express';
import adminJs from '../modules/Admin/admin-config.js';

const adminAuth = express.Router();
adminAuth.use((req, res, next) => {
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

export default adminAuth;
