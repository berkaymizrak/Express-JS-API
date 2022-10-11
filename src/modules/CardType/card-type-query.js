import cardTypes from './card-type-model.js';
import { resultLimit } from '../../config.js';

const cardTypesFindQuery = async (res, queryParams, { filters, projection, sorting, limit, skip }) => {
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
        .sort(sorting)
        .limit(limit)
        .skip(skip)
        .then(async data => {
            return await cardTypes.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: !!data,
                    mes: data
                        ? res.__('module_retrieved_successfully', {
                              module: res.__('Card') + ' ' + res.__('Types_of'),
                          })
                        : res.__('no_module_found', { module: res.__('card') + ' ' + res.__('type_of') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return {
                mes: res.__('error_fetching_module', { module: res.__('card') + ' ' + res.__('types_of') }),
                error,
            };
        });
};

const cardTypeCreateQuery = async (res, body) => {
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
                mes: res.__('module_created', { module: res.__('Card') + ' ' + res.__('Type_of') }),
                data,
            };
        })
        .catch(error => {
            return {
                mes: res.__('error_creating_module', { module: res.__('card') + ' ' + res.__('type_of') }),
                error,
            };
        });
};

const cardTypeUpdateQuery = async (res, filters, update, projection = { __v: 0 }) => {
    return await cardTypes
        .findOneAndUpdate(filters, { new: true, projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_updated', { module: res.__('Card') + ' ' + res.__('type_of') })
                    : res.__('module_not_found', { module: res.__('Card') + ' ' + res.__('type_of') }),
                data,
            };
        })
        .catch(error => {
            return {
                mes: res.__('error_updating_module', { module: res.__('Card') + ' ' + res.__('type_of') }),
                error,
            };
        });
};

const cardTypeDeleteQuery = async (res, filters, projection = { __v: 0 }) => {
    return await cardTypes
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_deleted', { module: res.__('Card') + ' ' + res.__('type_of') })
                    : res.__('module_not_found', { module: res.__('Card') + ' ' + res.__('type_of') }),
                data,
            };
        })
        .catch(error => {
            return {
                mes: res.__('error_deleting_module', { module: res.__('card') + ' ' + res.__('type_of') }),
                error,
            };
        });
};

export { cardTypeDeleteQuery, cardTypeCreateQuery, cardTypeUpdateQuery, cardTypesFindQuery };
