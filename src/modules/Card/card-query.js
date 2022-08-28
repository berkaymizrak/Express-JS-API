import Card from './card-model.js';
import { resultLimit } from '../../config.js';

const cardFindQuery = async (filters = null, projection = null, sorting = null, limit = null) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0 };
    if (!sorting) sorting = { createdAt: -1 };
    if (!limit) limit = resultLimit;

    return await Card.find(filters, projection)
        .limit(limit)
        .sort(sorting)
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Cards retrieved successfully',
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
};

const cardFindDetailedQuery = async (filters = null, projection = null, sorting = null, limit = null) => {
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
    if (!sorting) sorting = { createdAt: -1 };
    if (!limit) limit = resultLimit;

    // TODO - add pagination
    const skip = 0;

    return await Card.aggregate([
        ...filters,
        {
            $lookup: {
                from: 'cardtypes',
                localField: 'card_type_id',
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
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Cards retrieved successfully',
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
};

const cardCreateQuery = async body => {
    const { name, user_id, card_type_id, url_path } = body;
    return await new Card({
        name,
        user_id,
        card_type_id,
        url_path,
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
    return await Card.findOneAndUpdate(filters, update, { new: true, projection: projection })
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
    return await Card.findOneAndDelete(filters, { projection: projection })
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
