import express from 'express';
import {
    createUser,
    listTokens,
    loginUser,
    requestPasswordReset,
    resetPassword,
    resetPasswordConfirm,
} from './auth-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

const authRouter = express.Router();

authRouter
    .post('/signup', createUser)
    .post('/login', loginUser)
    .post('/request_password_reset', requestPasswordReset)
    .get('/confirm_password_reset', resetPasswordConfirm)
    .get('/reset_password', resetPassword)
    .get('/tokens', setPaginationParams, listTokens);

export default authRouter;
