import Cards from './card-model.js';
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

    return await Cards.find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await Cards.count(filters)
                .then(total_count => {
                    return {
                        status: 200,
                        success: true,
                        message: 'Cards retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return {
                        status: 500,
                        success: false,
                        message: 'Error fetching cards',
                        detailed_message: err.message,
                    };
                });
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            };
        });
};

const cardFindDetailedQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
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
    if (!projection) projection = {};
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await Cards.aggregate([
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
            return await Cards.count(filters)
                .then(total_count => {
                    return {
                        status: 200,
                        success: true,
                        message: 'Cards retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return {
                        status: 500,
                        success: false,
                        message: 'Error fetching cards',
                        detailed_message: err.message,
                    };
                });
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            };
        });
};

const cardCreateQuery = async body => {
    const { name, userId, cardTypeId, urlPath } = body;
    return await new Cards({
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
                message: 'Card created successfully',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error creating card',
                detailed_message: err.message,
            };
        });
};

const cardUpdateQuery = async (filters, update, projection = { __v: 0 }) => {
    return await Cards.findOneAndUpdate(filters, update, { new: true, projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'Card updated successfully' : 'Card not found',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting card',
                detailed_message: err.message,
            };
        });
};

const cardDeleteQuery = async (filters, projection = { __v: 0 }) => {
    return await Cards.findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'Card deleted successfully' : 'Card not found',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting card',
                detailed_message: err.message,
            };
        });
};

export { cardFindQuery, cardFindDetailedQuery, cardCreateQuery, cardUpdateQuery, cardDeleteQuery };
