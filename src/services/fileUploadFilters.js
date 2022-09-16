import multer from 'multer';

const imageFilter = (req, file, next) => {
    if (file.mimetype.split('/')[0] === 'image') {
        // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        next(null, true);
    } else {
        next({
            mes: 'Uploaded file format must be image.',
            status: 401,
            error: new multer.MulterError('LIMIT_UNEXPECTED_FILE', false),
        });
    }
};

export { imageFilter };
