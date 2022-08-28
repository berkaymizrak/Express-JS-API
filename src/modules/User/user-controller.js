// Models
import { userListQuery, userDeleteQuery, userGetQuery, userListDetailedQuery } from './user-query.js';

const listUsers = async (req, res, next) => {
    return next(await userListQuery());
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userListDetailedQuery());
};

const getUser = async (req, res, next) => {
    const { id } = req.params;

    return next(await userGetQuery(id));
};

const getDetailedUser = async (req, res, next) => {
    const { id } = req.params;
    let response = await userListDetailedQuery(id);
    let { success, data } = response;
    if (success) {
        data = data.find(card => card._id == id);
    }
    response['data'] = data;
    return next(response);
};

const updateUser = async (req, res, next) => {
    const { id } = req.params;
    return next(await userUpdateQuery(id));
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    return next(await userDeleteQuery(id));
};

export { listUsers, listDetailedUsers, getDetailedUser, getUser, updateUser, deleteUser };
