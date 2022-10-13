import express from 'express';
import {
    signupController,
    listTokens,
    loginUser,
    resetPasswordRequest,
    resetPasswordDone,
    resetPasswordConfirm,
} from './auth-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

const authRouter = express.Router();

authRouter
    .post('/signup', signupController)
    .post('/login', loginUser)
    .post('/reset_password_request', resetPasswordRequest)
    .get('/reset_password_confirm', resetPasswordConfirm)
    .post('/reset_password_done', resetPasswordDone)
    .get('/tokens', setPaginationParams, listTokens);

export default authRouter;
