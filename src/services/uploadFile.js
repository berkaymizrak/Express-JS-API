import multer from 'multer';
import multerS3 from 'multer-s3';
import { fileFilter } from './fileUploadFilters.js';
import { bucketName, s3Client } from '../config.js';

const uploadPPService = multer({
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
        files: 1,
    },
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
            const newFileName = `${req.session.user.username}-${Date.now()}-${file.originalname}`;
            const fullPath = 'static/profile_pictures/' + newFileName;
            next(null, fullPath);
        },
    }),
});

export { uploadPPService };
