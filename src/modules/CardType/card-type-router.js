import express from 'express';
const cardTypeRouter = express.Router();
import {
    getCardType,
    createCardType,
    listCardTypes,
    updateCardType,
    deleteCardType,
} from './card-type-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';

cardTypeRouter
    .get('/card_types', setPaginationParams, listCardTypes)
    .post('/card_types', createCardType)
    .get('/card_types/:id', getCardType)
    .put('/card_types/:id', updateCardType)
    .delete('/card_types/:id', deleteCardType);

export default cardTypeRouter;
