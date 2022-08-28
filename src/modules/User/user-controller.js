// Models
import { userDeleteQuery, userFindQuery, userListDetailedQuery, userUpdateQuery } from './user-query.js';
import mongoose from 'mongoose';

const listUsers = async (req, res, next) => {
    return next(await userFindQuery());
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userListDetailedQuery());
};

const getUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await userFindQuery(filters));
};

const getDetailedUser = async (req, res, next) => {
    const { id } = req.params;
    const filters = [
        {
            $match: { _id: mongoose.Types.ObjectId(id) },
        },
    ];
    let response = await userListDetailedQuery(filters);

    let { success, data } = response;
    if (success) {
        data = data.find(card => card._id == id);
    }
    response['data'] = data;
    return next(response);
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

export { listUsers, listDetailedUsers, getDetailedUser, getUser, updateUser, deleteUser };
