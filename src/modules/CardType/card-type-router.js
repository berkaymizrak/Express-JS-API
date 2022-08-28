import express from 'express';
const userRouter = express.Router();
import {
    getCardType,
    createCardType,
    listCardTypes,
    updateCardType,
    deleteCardType,
} from './card-type-controller.js';

userRouter
    .get('/card_types', listCardTypes)
    .post('/card_types', createCardType)
    .get('/card_types/:id', getCardType)
    .put('/card_types/:id', updateCardType)
    .delete('/card_types/:id', deleteCardType);

export default userRouter;
