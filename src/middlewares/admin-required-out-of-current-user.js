const adminRequiredOutOfCurrentUser = (req, res, next) => {
    const { id } = req.params;
    if (
        (req.session && req.session.adminUser) ||
        (req.session.user && req.session.user.role === 'admin') ||
        (req.session.user && req.session.user._id === id)
    ) {
        return next();
    } else {
        return next({ status: 401, success: false, mes: res.__('unauthorized_to_see') });
    }
};

export default adminRequiredOutOfCurrentUser;
