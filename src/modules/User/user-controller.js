// Models
import { logger } from '../../config.js';
import { userListQuery, userDeleteQuery, userFindByIdQuery, userListDetailedQuery } from './user-query.js';

const listUsers = async (req, res, next) => {
    return next(await userListQuery());
};

const listDetailedUsers = async (req, res, next) => {
    return next(await userListDetailedQuery());
};

const getUser = async (req, res, next) => {
    const { id } = req.params;

    return next(await userFindByIdQuery(id));
};

const getDetailedUser = async (req, res, next) => {
    const { id } = req.params;
    let { status, success, data } = await userListDetailedQuery(id);

    if (success) {
        data = data.find(user => user._id == id);
    }
    return next({
        status: 200,
        success: true,
        message: 'User retrieved successfully',
        data,
    });
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    return next(await userDeleteQuery(id));
};

export { listUsers, listDetailedUsers, getDetailedUser, getUser, deleteUser };
