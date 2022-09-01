import Users from './user-model.js';
import { resultLimit } from '../../config.js';

const userFindQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0, password: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await Users.find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await Users.count(filters)
                .then(total_count => {
                    return {
                        status: 200,
                        success: true,
                        message: 'Users retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return {
                        status: 500,
                        success: false,
                        message: 'Error fetching users',
                        detailed_message: err.message,
                    };
                });
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching users',
                detailed_message: err.message,
            };
        });
};

const userFindDetailedQuery = async (queryParams, { filters, projection, sorting, limit, skip }) => {
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
    if (!projection) projection = { password: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await Users.aggregate([
        ...filters,
        {
            $lookup: {
                from: 'cards',
                localField: '_id',
                foreignField: 'userId',
                as: 'cards',
            },
        },
        {
            $unwind: {
                path: '$cards',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: 'cardtypes',
                localField: 'cards.cardTypeId',
                foreignField: '_id',
                as: 'cards.cardtype',
            },
        },
        {
            $unwind: {
                path: '$cards.cardtype',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $group: {
                _id: '$_id',
                root: { $mergeObjects: '$$ROOT' },
                cards: { $push: '$cards' },
            },
        },
        {
            $addFields: {
                cards: {
                    $filter: {
                        input: '$cards',
                        cond: { $ifNull: ['$$this._id', false] },
                    },
                },
            },
        },
        {
            $addFields: {
                card_count: { $size: '$cards' },
                fullName: { $concat: ['$firstName', ' ', '$lastName'] },
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
                // Hide selected columns from the response
                root: 0,
                __v: 0,
                'cards.__v': 0,
                'cards.cardtype.__v': 0,
                active: 0,
                'cards.active': 0,
                'cards.cardtype.active': 0,
                ...projection,
            },
        },
    ])
        .sort(sorting)
        .then(async data => {
            return await Users.count(filters)
                .then(total_count => {
                    return {
                        status: 200,
                        success: true,
                        message: 'Users retrieved successfully',
                        total_count,
                        count: data.length,
                        data,
                    };
                })
                .catch(err => {
                    return {
                        status: 500,
                        success: false,
                        message: 'Error fetching users',
                        detailed_message: err.message,
                    };
                });
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching users',
                detailed_message: err.message,
            };
        });
};

const userCreateQuery = async body => {
    const { username, firstName, lastName, email, password } = body;
    return await new Users({
        username,
        firstName,
        lastName,
        email,
        password,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                message: 'User created successfully',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error creating user',
                detailed_message: err.message,
            };
        });
};

const userUpdateQuery = async (filters, update, projection = { __v: 0, password: 0 }) => {
    return await Users.findOneAndUpdate(filters, update, {
        new: true,
        projection: projection,
    })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'User updated successfully' : 'User not found',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error updating user',
                detailed_message: err.message,
            };
        });
};

const userDeleteQuery = async (filters, projection = { __v: 0, password: 0 }) => {
    return await Users.findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'User deleted successfully' : 'User not found',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting user',
                detailed_message: err.message,
            };
        });
};

export { userFindQuery, userFindDetailedQuery, userCreateQuery, userUpdateQuery, userDeleteQuery };
