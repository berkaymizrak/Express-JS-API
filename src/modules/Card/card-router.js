import express from 'express';
const cardRouter = express.Router();
import {
    listCards,
    listDetailedCards,
    getDetailedCard,
    createCard,
    getCard,
    updateCard,
    deleteCard,
} from './card-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

cardRouter
    .get('/cards', setPaginationParams, listCards)
    .get('/cards/detailed', setPaginationParams, listDetailedCards)
    .get('/cards/detailed/:id', getDetailedCard)
    .get('/cards/:id', getCard)
    .post('/cards', createCard)
    .put('/cards/:id', updateCard)
    .delete('/cards/:id', deleteCard);

export default cardRouter;
