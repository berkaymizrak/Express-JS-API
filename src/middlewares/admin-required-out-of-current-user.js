const adminRequiredOutOfCurrentUser = (req, res, next) => {
    const { id } = req.params;
    if (
        (req.session && req.session.adminUser) ||
        (req.session.user && req.session.user.role === 'admin') ||
        (req.session.user && req.session.user._id === id)
    ) {
        return next();
    } else {
        return next({ success: false, status: 401, mes: 'Unauthorized to access this resource' });
    }
};

export default adminRequiredOutOfCurrentUser;
