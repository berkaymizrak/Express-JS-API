import express from 'express';
const userRouter = express.Router();
import { listCards, createCard, getCard, deleteCard } from './card-controller.js';

userRouter
    .get('/cards', listCards)
    // .get('/cards/detailed', listDetailedCards)
    .post('/cards', createCard)
    .get('/cards/:id', getCard)
    // .get('/cards/detailed/:id', getDetailedCard)
    // .put('/cards/:id', updateCard)
    .delete('/cards/:id', deleteCard);

export default userRouter;
