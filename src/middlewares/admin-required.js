const adminRequired = (req, res, next) => {
    if ((req.session && req.session.adminUser) || (req.session.user && req.session.user.role === 'admin')) {
        return next();
    } else {
        return next({ status: 401, success: false, mes: res.__('unauthorized_to_see') });
    }
};

export default adminRequired;
