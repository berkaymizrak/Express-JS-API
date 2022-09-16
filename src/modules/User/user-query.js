import users from './user-model.js';
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

    return await users
        .find(filters, projection)
        .limit(limit)
        .skip(skip)
        .sort(sorting)
        .then(async data => {
            return await users.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: true,
                    mes: 'Users retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching users', error };
        });
};

const userFindDetailedQuery = async (
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
    if (!projection) projection = { password: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await users
        .aggregate([
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
                    cardCount: { $size: '$cards' },
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
            return await users.count(countFilters).then(totalCount => {
                return {
                    status: 200,
                    success: true,
                    mes: 'Users retrieved successfully',
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: 'Error fetching users', error };
        });
};

const userCreateQuery = async body => {
    const { username, firstName, lastName, email, password, role } = body;
    return await new users({
        username,
        firstName,
        lastName,
        email,
        password,
        role,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                mes: 'User created successfully',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error creating user', error };
        });
};

const userUpdateQuery = async (filters, update, projection = { __v: 0, password: 0 }) => {
    return await users
        .findOneAndUpdate(filters, update, {
            new: true,
            projection: projection,
        })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'User updated successfully' : 'User not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error updating user', error };
        });
};

const userDeleteQuery = async (filters, projection = { __v: 0, password: 0 }) => {
    return await users
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data ? 'User deleted successfully' : 'User not found',
                data,
            };
        })
        .catch(error => {
            return { mes: 'Error deleting user', error };
        });
};

export { userFindQuery, userFindDetailedQuery, userCreateQuery, userUpdateQuery, userDeleteQuery };
