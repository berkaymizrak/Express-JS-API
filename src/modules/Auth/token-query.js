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
            return await tokens
                .count(filters)
                .then(total_count => {
                    return {
                        status: 200,
                        success: true,
                        mes: 'Tokens retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return { mes: 'Error fetching tokens', err };
                });
        })
        .catch(err => {
            return { mes: 'Error fetching tokens', err };
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
        .catch(err => {
            return { mes: 'Error creating token', err };
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
        .catch(err => {
            return { mes: 'Error deleting token', err };
        });
};

export { tokenFindQuery, tokenCreateQuery, tokenDeleteQuery };
