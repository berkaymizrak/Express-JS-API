// Models
import CardType from './card-type-model.js';
import {
    cardTypeDeleteQuery,
    cardTypeGetQuery,
    cardTypeCreateQuery,
    cardTypesListQuery,
} from './card-type-query.js';

const listCardTypes = async (req, res, next) => {
    return next(await cardTypesListQuery());
};

const createCardType = async (req, res, next) => {
    return next(await cardTypeCreateQuery(req.body));
};

const getCardType = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardTypeGetQuery(id));
};

const updateCardType = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardTypeUpdateQuery(id));
};

const deleteCardType = async (req, res, next) => {
    const { id } = req.params;
    return next(await cardTypeDeleteQuery(id));
};

export { listCardTypes, createCardType, getCardType, updateCardType, deleteCardType };
