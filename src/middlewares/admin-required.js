import express from 'express';

const adminRequired = express.Router();

adminRequired.use((req, res, next) => {
    if ((req.session && req.session.adminUser) || (req.session.user && req.session.user.role === 'admin')) {
        return next();
    } else {
        return next({ success: false, status: 401, mes: 'Unauthorized to access this resource' });
    }
});

export default adminRequired;
