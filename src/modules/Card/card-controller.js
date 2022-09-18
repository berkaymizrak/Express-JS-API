import {
    cardCreateQuery,
    cardDeleteQuery,
    cardFindDetailedQuery,
    cardFindQuery,
    cardUpdateQuery,
} from './card-query.js';
import mongoose from 'mongoose';

const listCards = async (req, res, next) => {
    return next(await cardFindQuery(res, req.query, {}));
};

const listDetailedCards = async (req, res, next) => {
    return next(await cardFindDetailedQuery(res, req.query, {}));
};

const getCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardFindQuery(res, req.query, { filters, limit: 1 }));
};

const getDetailedCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = [];
    try {
        filters.push({
            $match: { _id: mongoose.Types.ObjectId(id) },
        });
    } catch (error) {
        return next({ mes: res.__('error_fetching_module', { module: res.__('cards') }), error });
    }
    const countFilters = { _id: id };
    return await cardFindDetailedQuery(res, req.query, { filters, countFilters, limit: 1 })
        .then(responseFindDetailedQuery => {
            let { success, data } = responseFindDetailedQuery;
            if (success) {
                data = data.find(elem => elem._id == id);
            }
            responseFindDetailedQuery['data'] = data;
            return next(responseFindDetailedQuery);
        })
        .catch(error => {
            return next({ mes: res.__('error_fetching_module', { module: res.__('card') }), error });
        });
};

const createCard = async (req, res, next) => {
    return next(await cardCreateQuery(res, req.body));
};

const updateCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardUpdateQuery(res, filters, req.body));
};

const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardDeleteQuery(res, filters));
};

export { listCards, listDetailedCards, createCard, getCard, updateCard, getDetailedCard, deleteCard };
