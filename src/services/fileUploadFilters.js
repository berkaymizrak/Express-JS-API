const fileFilter = (req, res, next) => {
    if (res.mimetype.split('/')[0] === 'image') {
        // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        next(null, true);
    } else {
        next(new Error(req.res.__('file_type_not_allowed')));
    }
};

export { fileFilter };
