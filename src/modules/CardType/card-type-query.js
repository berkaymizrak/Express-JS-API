import cardTypes from './card-type-model.js';
import { resultLimit } from '../../config.js';

const cardTypesFindQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await cardTypes
        .find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await cardTypes.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: true,
                    mes: 'Card Types retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching card types', error };
        });
};

const cardTypeCreateQuery = async body => {
    const { name, icon, base_url } = body;
    return await new cardTypes({
        name,
        icon,
        base_url,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                mes: 'Card Type created successfully',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error creating card type', error };
        });
};

const cardTypeUpdateQuery = async (filters, update, projection = { __v: 0 }) => {
    return await cardTypes
        .findOneAndUpdate(filters, { new: true, projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'Card type updated successfully' : 'Card type not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error updating card type', error };
        });
};

const cardTypeDeleteQuery = async (filters, projection = { __v: 0 }) => {
    return await cardTypes
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'Card type deleted successfully' : 'Card type not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error deleting card type', error };
        });
};

export { cardTypeDeleteQuery, cardTypeCreateQuery, cardTypeUpdateQuery, cardTypesFindQuery };
