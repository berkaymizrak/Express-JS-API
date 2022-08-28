import express from 'express';
const userRouter = express.Router();
import {
    getUser,
    listDetailedUsers,
    getDetailedUser,
    listUsers,
    updateUser,
    deleteUser,
} from './user-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

userRouter
    .get('/users', setPaginationParams, listUsers)
    .get('/users/detailed', setPaginationParams, listDetailedUsers)
    .get('/users/detailed/:id', getDetailedUser)
    .get('/users/:id', getUser)
    .put('/users/:id', updateUser)
    .delete('/users/:id', deleteUser);

export default userRouter;
