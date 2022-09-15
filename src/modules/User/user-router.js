import express from 'express';
import {
    getUser,
    listDetailedUsers,
    getDetailedUser,
    listUsers,
    updateUser,
    deleteUser,
} from './user-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';
import adminRequired from '../../middlewares/admin-required.js';
import adminRequiredOutOfCurrentUser from '../../middlewares/admin-required-out-of-current-user.js';

const userRouter = express.Router();

userRouter
    .get('/users', adminRequired, setPaginationParams, listUsers)
    .get('/users/detailed', adminRequired, setPaginationParams, listDetailedUsers)
    .get('/users/detailed/:id', adminRequiredOutOfCurrentUser, getDetailedUser)
    .get('/users/:id', adminRequiredOutOfCurrentUser, getUser)
    .put('/users/:id', adminRequiredOutOfCurrentUser, updateUser)
    .delete('/users/:id', adminRequiredOutOfCurrentUser, deleteUser);

export default userRouter;
