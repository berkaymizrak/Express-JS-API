const adminRequired = (req, res, next) => {
    if ((req.session && req.session.adminUser) || (req.session.user && req.session.user.role === 'admin')) {
        return next();
    } else {
        return next({ status: 401, success: false, mes: 'Unauthorized to access this resource' });
    }
};

export default adminRequired;
