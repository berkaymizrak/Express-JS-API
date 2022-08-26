import express from 'express';
const userRouter = express.Router();
import { getUser, listUsers, deleteUser } from './user-controller.js';

userRouter
    .get('/users', listUsers)
    // .get('/users/detailed', listDetailedUsers)
    .get('/users/:id', getUser)
    // .get('/users/detailed/:id', getDetailedUser)
    // .put('/users/:id', updateUser)
    .delete('/users/:id', deleteUser);

export default userRouter;
