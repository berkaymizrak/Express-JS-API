import User from './user-model.js';
import mongoose from 'mongoose';

const userListQuery = async () => {
    return await User.find({}, { __v: 0, password: 0 })
        .sort({ createdAt: -1 })
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

const userGetQuery = async id => {
    return await User.findById({ _id: id }, { __v: 0, password: 0 })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'User not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'User retrieved successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching user',
                detailed_message: err.message,
            };
        });
};

const userListDetailedQuery = async id => {
    const extraQuery = [];
    if (id) {
        extraQuery.push({
            $match: { _id: mongoose.Types.ObjectId(id) },
        });
    }
    return await User.aggregate(
        extraQuery.concat([
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
            {
                $project: {
                    // Hide selected columns from the response
                    root: 0,
                    password: 0,
                    __v: 0,
                    'cards.__v': 0,
                    'cards.cardtype.__v': 0,
                    active: 0,
                    'cards.active': 0,
                    'cards.cardtype.active': 0,
                },
            },
        ])
    )
        .sort({ createdAt: -1 })
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

const userUpdateQuery = async id => {
    return await User.findByIdAndUpdate(id, { $new: true })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'User not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'User deleted successfully',
                    data,
                };
            }
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

const userDeleteQuery = async id => {
    return await User.findOneAndDelete(id)
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'User not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'User deleted successfully',
                    data,
                };
            }
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

export { userListQuery, userGetQuery, userListDetailedQuery, userUpdateQuery, userDeleteQuery };
