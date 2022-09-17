import { userDeleteQuery, userFindQuery, userFindDetailedQuery, userUpdateQuery } from './user-query.js';
import mongoose from 'mongoose';
import { uploadPPService } from '../../services/uploadFile.js';

const listUsers = async (req, res, next) => {
    return next(await userFindQuery(req.query, {}));
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userFindDetailedQuery(req.query, {}));
};

const getUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userFindQuery(req.query, { filters, limit: 1 }));
};

const getDetailedUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = [];
    try {
        filters.push({
            $match: { _id: mongoose.Types.ObjectId(id) },
        });
    } catch (error) {
        return next({ mes: 'Error fetching users', error });
    }
    const countFilters = { _id: id };
    return await userFindDetailedQuery(req.query, { filters, countFilters, limit: 1 })
        .then(responseFindDetailedQuery => {
            let { success, data } = responseFindDetailedQuery;
            if (success) {
                data = data.find(elem => elem._id == id);
            }
            responseFindDetailedQuery['data'] = data;
            return next(responseFindDetailedQuery);
        })
        .catch(error => {
            return next({ mes: 'Error fetching user', error });
        });
};

const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userUpdateQuery(filters, req.body));
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userDeleteQuery(filters));
};

const uploadProfilePicture = async (req, res, next) => {
    const error_message = 'An error occurred while uploading profile picture';
    return await uploadPPService.single('file')(req, res, async function (error) {
        if (error) {
            return next({ mes: error_message, error });
        }
        const { file } = req;
        if (file) {
            return await userUpdateQuery(
                { _id: req.session.user._id },
                { profilePicture: file.location }
            ).then(responseUpdateQuery => {
                let mes;
                if (responseUpdateQuery.success) {
                    mes = 'Profile picture uploaded successfully';
                } else {
                    mes = error_message;
                }
                return next({
                    ...responseUpdateQuery,
                    mes,
                });
            });
        } else {
            return next({ status: 400, success: false, mes: 'No file was uploaded' });
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
};
