import tokens from './token-model.js';
import { resultLimit } from '../../config.js';

const tokenFindQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await tokens
        .find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await tokens.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: true,
                    mes: 'Tokens retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching tokens', error };
        });
};

const tokenCreateQuery = async body => {
    const { userId, token } = body;
    return await new tokens({
        userId,
        token,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                mes: 'Token created successfully',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error creating token', error };
        });
};

const tokenDeleteQuery = async (filters, projection = { __v: 0 }) => {
    return await tokens
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'Token deleted successfully' : 'Token not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error deleting token', error };
        });
};

export { tokenFindQuery, tokenCreateQuery, tokenDeleteQuery };
