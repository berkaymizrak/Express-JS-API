// Models
import User from './user-model.js';

const listUsers = async (req, res, next) => {
    await User.find()
        .sort({ createdAt: -1 })
        .select('-__v')
        .then(users => {
            return res.status(200).send({
                success: true,
                message: 'Users retrieved successfully',
                count: users.length,
                data: users,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching users',
                detailed_message: err.message,
            });
        });
};

const listDetailedUsers = async (req, res, next) => {
    await User.aggregate([
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
        .sort({ createdAt: -1 })
        .then(users => {
            return res.status(200).send({
                success: true,
                message: 'Users retrieved successfully',
                count: users.length,
                data: users,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching users',
                detailed_message: err.message,
            });
        });
};

const getUser = async (req, res, next) => {
    const { id } = req.params;
    await User.findById(id)
        .then(user => {
            if (!user) {
                return res.status(200).send({
                    success: false,
                    message: 'User not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'User retrieved successfully',
                    data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching user',
                detailed_message: err.message,
            });
        });
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    await User.findOneAndDelete(id)
        .then(user => {
            if (!user) {
                return res.status(200).send({
                    success: false,
                    message: 'User not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'User deleted successfully',
                    data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error deleting user',
                detailed_message: err.message,
            });
        });
};

export { listUsers, listDetailedUsers, getUser, deleteUser };
