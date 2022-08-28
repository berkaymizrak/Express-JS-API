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

userRouter
    .get('/users', listUsers)
    .get('/users/detailed', listDetailedUsers)
    .get('/users/detailed/:id', getDetailedUser)
    .get('/users/:id', getUser)
    .put('/users/:id', updateUser)
    .delete('/users/:id', deleteUser);

export default userRouter;
