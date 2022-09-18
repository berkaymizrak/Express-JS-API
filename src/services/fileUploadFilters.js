import multer from 'multer';

const imageFilter = (req, res, next) => {
    if (res.mimetype.split('/')[0] === 'image') {
        // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        next(null, true);
    } else {
        next({
            mes: res.__('file_type_not_allowed'),
            status: 401,
            error: new multer.MulterError('LIMIT_UNEXPECTED_FILE', false),
        });
    }
};

export { imageFilter };
