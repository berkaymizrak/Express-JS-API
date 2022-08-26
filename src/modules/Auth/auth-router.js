import express from 'express';
import { createUser, loginUser } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', createUser).post('/login', loginUser);

export default authRouter;
