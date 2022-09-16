import multer from 'multer';
import multerS3 from 'multer-s3';
import { imageFilter } from '../services/fileUploadFilters.js';
import { bucketName, s3Client } from '../config.js';

const uploadPPMiddleware = multer({
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
            next(
                null,
                file.originalname.replace(/\.[^/.]+$/, '') +
                    '_' +
                    Date.now().toString() +
                    '.' +
                    file.originalname.split('.').pop()
            );
        },
    }),
});

export { uploadPPMiddleware };
