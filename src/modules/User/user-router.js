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

const userRouter = express.Router();

userRouter
    .get('/users', adminRequired, setPaginationParams, listUsers)
    .get('/users/detailed', adminRequired, setPaginationParams, listDetailedUsers)
    .get('/users/detailed/:id', adminRequired, getDetailedUser)
    .get('/users/:id', adminRequired, getUser)
    .put('/users/:id', adminRequired, updateUser)
    .delete('/users/:id', adminRequired, deleteUser);

export default userRouter;
