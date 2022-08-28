import User from './user-model.js';
import { JWT_ALGORITHM, JWT_REFRESH_ALGORITHM, resultLimit } from '../../config.js';

const userFindQuery = async (filters, projection, sorting, limit) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0, password: 0 };
    if (!sorting) sorting = { createdAt: -1 };
    if (!limit) limit = resultLimit;

    return await User.find(filters, projection)
        .limit(limit)
        .sort(sorting)
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Users retrieved successfully',
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
};

const userFindDetailedQuery = async (filters, projection, sorting, limit) => {
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
    if (!sorting) sorting = { createdAt: -1 };
    if (!limit) limit = resultLimit;

    // TODO - add pagination
    const skip = 0;

    return await User.aggregate([
        ...filters,
        {
            $lookup: {
                from: 'cards',
                localField: '_id',
                foreignField: 'user_id',
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
                localField: 'cards.card_type_id',
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
        { $limit: skip + limit },
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
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Users retrieved successfully',
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
};

const userCreateQuery = async body => {
    const { username, firstName, lastName, email, password } = body;
    return await new User({
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
    return await User.findOneAndUpdate(filters, update, {
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
    return await User.findOneAndDelete(filters, { projection: projection })
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
