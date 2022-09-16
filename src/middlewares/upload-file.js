import multer from 'multer';
import multerS3 from 'multer-s3';
import { bucketName, s3Client } from '../config.js';

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

const upload = multer({
    imageFilter,
    limits: { fileSize: 1024 * 1024 * 5, files: 1 },
    storage: multerS3({
        // acl: 'public-read',
        s3: s3Client,
        bucket: bucketName,
        metadata: function (req, file, next) {
            next(null, {
                fileType: 'Profile_Picture',
                username: req.session.user.username,
                user_id: req.session.user._id,
            });
        },
        key: function (req, file, next) {
            next(null, Date.now().toString() + '_' + file.originalname);
        },
    }),
});

export { upload };
