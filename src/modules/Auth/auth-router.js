import express from 'express';
import { createUser, loginUser, resetPassword } from './auth-controller.js';

const authRouter = express.Router();

authRouter.post('/signup', createUser).post('/login', loginUser).post('/reset-password', resetPassword);

export default authRouter;
