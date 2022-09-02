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
                        message: 'Tokens retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return {
                        status: 500,
                        success: false,
                        message: 'Error fetching tokens',
                        detailed_message: err.message,
                    };
                });
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching tokens',
                detailed_message: err.message,
            };
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
                message: 'Token created successfully',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error creating token',
                detailed_message: err.message,
            };
        });
};

const tokenDeleteQuery = async (filters, projection = { __v: 0 }) => {
    return await tokens
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'Token deleted successfully' : 'Token not found',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting token',
                detailed_message: err.message,
            };
        });
};

export { tokenFindQuery, tokenCreateQuery, tokenDeleteQuery };
