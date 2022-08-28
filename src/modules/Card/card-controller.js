// Models
import {
    cardCreateQuery,
    cardDeleteQuery,
    cardGetQuery,
    cardListDetailedQuery,
    cardListQuery,
    cardUpdateQuery,
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

const getDetailedCard = async (req, res, next) => {
    const { id } = req.params;
    let response = await cardListDetailedQuery(id);
    let { success, data } = response;
    if (success) {
        data = data.find(card => card._id == id);
    }
    response['data'] = data;
    return next(response);
};

const updateCard = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardUpdateQuery(id));
};

const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardDeleteQuery(id));
};

export { listCards, listDetailedCards, createCard, getCard, updateCard, getDetailedCard, deleteCard };
