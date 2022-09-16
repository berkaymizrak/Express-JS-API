import cards from './card-model.js';
import { resultLimit } from '../../config.js';

const cardFindQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
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
                    success: true,
                    mes: 'Cards retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching cards', error };
        });
};

const cardFindDetailedQuery = async (
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
                    success: true,
                    mes: 'Cards retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching cards', error };
        });
};

const cardCreateQuery = async body => {
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
                mes: 'Card created successfully',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error creating card', error };
        });
};

const cardUpdateQuery = async (filters, update, projection = { __v: 0 }) => {
    return await cards
        .findOneAndUpdate(filters, update, { new: true, projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'Card updated successfully' : 'Card not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error deleting card', error };
        });
};

const cardDeleteQuery = async (filters, projection = { __v: 0 }) => {
    return await cards
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'Card deleted successfully' : 'Card not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error deleting card', error };
        });
};

export { cardFindQuery, cardFindDetailedQuery, cardCreateQuery, cardUpdateQuery, cardDeleteQuery };
