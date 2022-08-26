import express from 'express';
const userRouter = express.Router();
import { getCardType, listCardTypes, deleteCardType } from './card-type-controller.js';

userRouter
    .get('/card_types', listCardTypes)
    // .get('/card_types/detailed', listDetailedCardTypes)
    .get('/card_types/:id', getCardType)
    // .get('/card_types/detailed/:id', getDetailedCardType)
    // .put('/card_types/:id', updateCardType)
    .delete('/card_types/:id', deleteCardType);

export default userRouter;
