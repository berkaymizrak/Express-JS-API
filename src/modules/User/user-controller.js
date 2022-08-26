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

export { getUser, listUsers, deleteUser };
