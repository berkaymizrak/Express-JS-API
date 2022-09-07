import { userDeleteQuery, userFindQuery, userFindDetailedQuery, userUpdateQuery } from './user-query.js';
import mongoose from 'mongoose';

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
    } catch (err) {
        return next({ mes: 'Error fetching users', err });
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
        .catch(err => {
            return next({ mes: 'Error fetching user', err });
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

export { listUsers, listDetailedUsers, getDetailedUser, getUser, updateUser, deleteUser };
