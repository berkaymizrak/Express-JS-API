import cards from './card-model.js';
import { resultLimit } from '../../config.js';

const cardFindQuery = async (res, queryParams, { filters, projection, sorting, limit, skip }) => {
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

    return await cards
        .find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await cards.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: !!data,
                    mes: data
                        ? res.__('module_retrieved_successfully', { module: res.__('Cards') })
                        : res.__('no_module_found', { module: res.__('card') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: res.__('error_fetching_module', { module: res.__('cards') }), error };
        });
};

const cardFindDetailedQuery = async (
    res,
    queryParams,
    { filters, countFilters, projection, sorting, limit, skip }
) => {
    // EXAMPLE
    // const filters = [
    //     {
    //         $match: { _id: mongoose.Types.ObjectId(id) },
    //     },
    //     {
    //         // REGEX:
    //         $match: { username: /.*mizrak.*/ },
    //     },
    //     {
    //         $match: { email: /.*localhost.com.*/ },
    //     },
    //     {
    //         username: { $in: [ 'berkay', 'mizrak' ] }
    //     },
    // ];
    if (!filters) filters = [];
    if (!countFilters) countFilters = {};
    if (!projection) projection = {};
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await cards
        .aggregate([
            ...filters,
            {
                $lookup: {
                    from: 'cardtypes',
                    localField: 'cardTypeId',
                    foreignField: '_id',
                    as: 'cardtype',
                },
            },
            {
                $unwind: {
                    path: '$cardtype',
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $group: {
                    _id: '$_id',
                    root: { $mergeObjects: '$$ROOT' },
                    cardtype: { $first: '$cardtype' },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$root', '$$ROOT'],
                    },
                },
            },
            { $limit: limit },
            { $skip: skip },
            {
                $project: {
                    root: 0,
                    __v: 0,
                    'cardtype.__v': 0,
                    active: 0,
                    'cardtype.active': 0,
                    ...projection,
                },
            },
        ])
        .sort(sorting)
        .then(async data => {
            return await cards.count(countFilters).then(totalCount => {
                return {
                    status: 200,
                    success: !!data,
                    mes: data
                        ? res.__('module_retrieved_successfully', { module: res.__('Cards') })
                        : res.__('no_module_found', { module: res.__('card') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: res.__('error_fetching_module', { module: res.__('cards') }), error };
        });
};

const cardCreateQuery = async (res, body) => {
    const { name, userId, cardTypeId, urlPath } = body;
    return await new cards({
        name,
        userId,
        cardTypeId,
        urlPath,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                mes: res.__('module_created', { module: res.__('Card') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_creating', { module: res.__('card') }), error };
        });
};

const cardUpdateQuery = async (res, filters, update, projection = { __v: 0 }) => {
    return await cards
        .findOneAndUpdate(filters, update, { new: true, projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_updated', { module: res.__('Card') })
                    : res.__('module_not_found', { module: res.__('Card') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_deleting_module', { module: res.__('card') }), error };
        });
};

const cardDeleteQuery = async (res, filters, projection = { __v: 0 }) => {
    return await cards
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_deleted', { module: res.__('Card') })
                    : res.__('module_not_found', { module: res.__('Card') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_deleting_module', { module: res.__('card') }), error };
        });
};

export { cardFindQuery, cardFindDetailedQuery, cardCreateQuery, cardUpdateQuery, cardDeleteQuery };
