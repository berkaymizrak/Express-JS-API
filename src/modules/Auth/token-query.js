import tokens from './token-model.js';
import { resultLimit } from '../../config.js';

const tokenFindQuery = async (res, queryParams, { filters, projection, sorting, limit, skip }) => {
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
                    mes: res.__('module_retrieved_successfully', { module: res.__('Tokens') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: res.__('error_fetching_module', { module: res.__('tokens') }), error };
        });
};

const tokenCreateQuery = async (res, body) => {
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
                mes: res.__('module_created', { module: res.__('Token') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_creating_module', { module: res.__('token') }), error };
        });
};

const tokenDeleteQuery = async (res, filters, projection = { __v: 0 }) => {
    return await tokens
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_deleted', { module: res.__('Token') })
                    : res.__('module_not_found', { module: res.__('Token') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_deleting_module', { module: res.__('token') }), error };
        });
};

export { tokenFindQuery, tokenCreateQuery, tokenDeleteQuery };
