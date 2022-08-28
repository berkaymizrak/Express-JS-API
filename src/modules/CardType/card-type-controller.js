import {
    cardTypeDeleteQuery,
    cardTypeCreateQuery,
    cardTypesFindQuery,
    cardTypeUpdateQuery,
} from './card-type-query.js';

const listCardTypes = async (req, res, next) => {
    return next(await cardTypesFindQuery());
};

const getCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypesFindQuery(filters));
};

const createCardType = async (req, res, next) => {
    return next(await cardTypeCreateQuery(req.body));
};

const updateCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypeUpdateQuery(filters, req.body));
};

const deleteCardType = async (req, res, next) => {
    const { id } = req.params;
    const filters = { _id: id };
    return next(await cardTypeDeleteQuery(filters));
};

export { listCardTypes, createCardType, getCardType, updateCardType, deleteCardType };
