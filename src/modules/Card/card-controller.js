// Models
import Card from './card-model.js';
import {
    cardCreateQuery,
    cardDeleteQuery,
    cardGetQuery,
    cardListDetailedQuery,
    cardListQuery,
} from './card-query.js';

const listCards = async (req, res, next) => {
    return next(await cardListQuery());
};

const listDetailedCards = async (req, res, next) => {
    return next(await cardListDetailedQuery());
};

const createCard = async (req, res, next) => {
    return next(await cardCreateQuery(req.body));
};

const getCard = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardGetQuery(id));
};

const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardDeleteQuery(id));
};

export { listCards, listDetailedCards, createCard, getCard, deleteCard };
