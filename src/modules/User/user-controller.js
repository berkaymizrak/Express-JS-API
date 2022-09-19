import { userDeleteQuery, userFindQuery, userFindDetailedQuery, userUpdateQuery } from './user-query.js';
import mongoose from 'mongoose';
import { uploadPPService } from '../../services/uploadFile.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { bucketName, logger, s3Client } from '../../config.js';

const listUsers = async (req, res, next) => {
    return next(await userFindQuery(res, req.query, {}));
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userFindDetailedQuery(res, req.query, {}));
};

const getUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userFindQuery(res, req.query, { filters, limit: 1 }));
};

const getDetailedUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = [];
    try {
        filters.push({
            $match: { _id: mongoose.Types.ObjectId(id) },
        });
    } catch (error) {
        return next({ mes: res.__('error_fetching_module', { module: res.__('users') }), error });
    }
    const countFilters = { _id: id };
    return await userFindDetailedQuery(res, req.query, { filters, countFilters, limit: 1 })
        .then(responseFindDetailedQuery => {
            let { success, data } = responseFindDetailedQuery;
            if (success) {
                data = data.find(elem => elem._id == id);
            }
            responseFindDetailedQuery['data'] = data;
            return next(responseFindDetailedQuery);
        })
        .catch(error => {
            return next({ mes: res.__('error_fetching_module', { module: res.__('users') }), error });
        });
};

const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userUpdateQuery(res, filters, req.body));
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userDeleteQuery(res, filters));
};

const uploadProfilePicture = async (req, res, next) => {
    const error_message = res.__('error_upload_profile_picture');
    return await uploadPPService.single('file')(req, res, async function (error) {
        if (error) {
            return next({ status: 400, mes: error.message ? error.message : error_message, error });
        }
        const { file } = req;
        if (file) {
            const filters = { _id: req.session.user._id };
            return await userFindQuery(res, req.query, { filters, limit: 1 })
                .then(async responseFindQuery => {
                    const { success, data } = responseFindQuery;
                    if (success) {
                        const { username, profilePictureKey } = data[0];
                        if (!data[0].schema.methods.isProfilePictureDefault(profilePictureKey)) {
                            await s3Client
                                .send(
                                    new DeleteObjectCommand({
                                        Bucket: bucketName,
                                        Key: profilePictureKey,
                                    })
                                )
                                .then(() => {
                                    logger.info(
                                        `Delete profile picture for user: ${username}. Deleted profile picture with key: ${profilePictureKey}`
                                    );
                                })
                                .catch(error => {
                                    logger.error(
                                        `! ERROR !! Delete profile picture for user: ${username}. Error deleting profile picture with key: ${profilePictureKey}`,
                                        error
                                    );
                                });
                        }
                    }
                })
                .then(async () => {
                    return await userUpdateQuery(res, filters, {
                        profilePictureLocation: file.location,
                        profilePictureKey: file.key,
                    }).then(responseUpdateQuery => {
                        let mes;
                        if (responseUpdateQuery.success) {
                            mes = res.__('success_upload_profile_picture');
                        } else {
                            mes = error_message;
                            userUpdateQuery(res, filters, {
                                $unset: { profilePictureLocation: '', profilePictureKey: '' },
                            });
                        }
                        return next({
                            ...responseUpdateQuery,
                            mes,
                        });
                    });
                });
        } else {
            return next({ status: 400, success: false, mes: res.__('no_file_uploaded') });
        }
    });
};

const deleteProfilePicture = async (req, res, next) => {
    const filters = { _id: req.session.user._id };
    return await userFindQuery(res, req.query, { filters, limit: 1 })
        .then(async responseFindQuery => {
            const { success, data } = responseFindQuery;
            if (success) {
                const { username, profilePictureKey } = data[0];
                if (!data[0].schema.methods.isProfilePictureDefault(profilePictureKey)) {
                    return await s3Client
                        .send(
                            new DeleteObjectCommand({
                                Bucket: bucketName,
                                Key: profilePictureKey,
                            })
                        )
                        .then(() => {
                            logger.info(
                                `Delete profile picture for user: ${username}. Deleted profile picture with key: ${profilePictureKey}`
                            );
                            return {
                                success: true,
                                mes: res.__('module_deleted', {
                                    module: res.__('Profile') + ' ' + res.__('picture_of'),
                                }),
                            };
                        })
                        .catch(error => {
                            logger.error(
                                `! ERROR !! Delete profile picture for user: ${username}. Error deleting profile picture with key: ${profilePictureKey}`,
                                error
                            );
                            return {
                                success: false,
                                mes: res.__('error_deleting_module', {
                                    module: res.__('profile') + ' ' + res.__('picture_of'),
                                }),
                            };
                        });
                } else {
                    return { status: 400, success: false, mes: res.__('picture_is_not_exist') };
                }
            } else {
                return responseFindQuery;
            }
        })
        .then(async responseDeleteProfilePicture => {
            if (responseDeleteProfilePicture.success) {
                return await userUpdateQuery(res, filters, {
                    $unset: { profilePictureLocation: '', profilePictureKey: '' },
                }).then(responseUpdateQuery => {
                    if (!responseUpdateQuery.success) {
                        responseDeleteProfilePicture.mes = res.__('error_deleting_profile_picture');
                    }
                    return next(responseDeleteProfilePicture);
                });
            } else {
                return next(responseDeleteProfilePicture);
            }
        });
};

export {
    listUsers,
    listDetailedUsers,
    getDetailedUser,
    getUser,
    updateUser,
    deleteUser,
    uploadProfilePicture,
    deleteProfilePicture,
};
