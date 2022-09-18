import {
    cardTypeDeleteQuery,
    cardTypeCreateQuery,
    cardTypesFindQuery,
    cardTypeUpdateQuery,
} from './card-type-query.js';

const listCardTypes = async (req, res, next) => {
    return next(await cardTypesFindQuery(res, req.query, {}));
};

const getCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypesFindQuery(res, req.query, { filters, limit: 1 }));
};

const createCardType = async (req, res, next) => {
    return next(await cardTypeCreateQuery(res, req.body));
};

const updateCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypeUpdateQuery(res, filters, req.body));
};

const deleteCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypeDeleteQuery(res, filters));
};

export { listCardTypes, createCardType, getCardType, updateCardType, deleteCardType };
