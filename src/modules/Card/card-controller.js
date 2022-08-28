import {
    cardCreateQuery,
    cardDeleteQuery,
    cardFindDetailedQuery,
    cardFindQuery,
    cardUpdateQuery,
} from './card-query.js';
import mongoose from 'mongoose';

const listCards = async (req, res, next) => {
    return next(await cardFindQuery());
};

const listDetailedCards = async (req, res, next) => {
    return next(await cardFindDetailedQuery());
};

const getCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardFindQuery(filters));
};

const getDetailedCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = [
        {
            $match: { _id: mongoose.Types.ObjectId(id) },
        },
    ];
    let response = await cardFindDetailedQuery(filters);
    let { success, data } = response;
    if (success) {
        data = data.find(elem => elem._id == id);
    }
    response['data'] = data;
    return next(response);
};

const createCard = async (req, res, next) => {
    return next(await cardCreateQuery(req.body));
};

const updateCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardUpdateQuery(filters, req.body));
};

const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardDeleteQuery(filters));
};

export { listCards, listDetailedCards, createCard, getCard, updateCard, getDetailedCard, deleteCard };
