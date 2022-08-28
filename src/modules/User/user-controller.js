import { userDeleteQuery, userFindQuery, userFindDetailedQuery, userUpdateQuery } from './user-query.js';
import mongoose from 'mongoose';

const listUsers = async (req, res, next) => {
    return next(await userFindQuery());
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userFindDetailedQuery());
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
    let response = await userFindDetailedQuery(filters);
    let { success, data } = response;
    if (success) {
        data = data.find(elem => elem._id == id);
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
