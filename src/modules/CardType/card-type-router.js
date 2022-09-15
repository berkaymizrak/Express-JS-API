import express from 'express';
import {
    getCardType,
    createCardType,
    listCardTypes,
    updateCardType,
    deleteCardType,
} from './card-type-controller.js';
import setPaginationParams from '../../middlewares/pagination-params.js';
import adminRequired from '../../middlewares/admin-required.js';

const cardTypeRouter = express.Router();

cardTypeRouter
    .get('/card_types', adminRequired, setPaginationParams, listCardTypes)
    .post('/card_types', adminRequired, createCardType)
    .get('/card_types/:id', adminRequired, getCardType)
    .put('/card_types/:id', adminRequired, updateCardType)
    .delete('/card_types/:id', adminRequired, deleteCardType);

export default cardTypeRouter;
