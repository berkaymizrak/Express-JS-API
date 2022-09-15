import express from 'express';
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
import adminRequired from '../../middlewares/admin-required.js';

const cardRouter = express.Router();

cardRouter
    .get('/cards', adminRequired, setPaginationParams, listCards)
    .get('/cards/detailed', adminRequired, setPaginationParams, listDetailedCards)
    .get('/cards/detailed/:id', adminRequired, getDetailedCard)
    .get('/cards/:id', adminRequired, getCard)
    .post('/cards', adminRequired, createCard)
    .put('/cards/:id', adminRequired, updateCard)
    .delete('/cards/:id', adminRequired, deleteCard);

export default cardRouter;
