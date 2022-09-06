import express from 'express';
import {
    createUser,
    listTokens,
    loginUser,
    resetPasswordRequest,
    resetPasswordDone,
    resetPasswordConfirm,
} from './auth-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

const authRouter = express.Router();

authRouter
    .post('/signup', createUser)
    .post('/login', loginUser)
    .post('/reset_password_request', resetPasswordRequest)
    .get('/reset_password_confirm', resetPasswordConfirm)
    .get('/reset_password_done', resetPasswordDone)
    .get('/tokens', setPaginationParams, listTokens);

export default authRouter;
