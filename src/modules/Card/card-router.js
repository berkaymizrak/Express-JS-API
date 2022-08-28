import express from 'express';
const userRouter = express.Router();
import {
    listCards,
    listDetailedCards,
    getDetailedCard,
    createCard,
    getCard,
    updateCard,
    deleteCard,
} from './card-controller.js';

userRouter
    .get('/cards', listCards)
    .get('/cards/detailed', listDetailedCards)
    .get('/cards/detailed/:id', getDetailedCard)
    .get('/cards/:id', getCard)
    .post('/cards', createCard)
    .put('/cards/:id', updateCard)
    .delete('/cards/:id', deleteCard);

export default userRouter;
