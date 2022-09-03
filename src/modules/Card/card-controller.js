import {
    cardCreateQuery,
    cardDeleteQuery,
    cardFindDetailedQuery,
    cardFindQuery,
    cardUpdateQuery,
} from './card-query.js';
import mongoose from 'mongoose';

const listCards = async (req, res, next) => {
    return next(await cardFindQuery(req.query, {}));
};

const listDetailedCards = async (req, res, next) => {
    return next(await cardFindDetailedQuery(req.query, {}));
};

const getCard = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardFindQuery(req.query, { filters, limit: 1 }));
};

const getDetailedCard = async (req, res, next) => {
    const { id } = req.params;
    let filters;
    try {
        filters = [
            {
                $match: { _id: mongoose.Types.ObjectId(id) },
            },
        ];
    } catch (err) {
        return next({ mes: 'Error fetching cards', err });
    }
    return await cardFindDetailedQuery(req.query, { filters, limit: 1 })
        .then(responseFindDetailedQuery => {
            let { success, data } = responseFindDetailedQuery;
            if (success) {
                data = data.find(elem => elem._id == id);
            }
            responseFindDetailedQuery['data'] = data;
            responseFindDetailedQuery['total_count'] = 1;
            return next(responseFindDetailedQuery);
        })
        .catch(err => {
            return next({ mes: 'Error fetching card', err });
        });
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
