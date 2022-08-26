// Models
import User from './user-model.js';

const listUsers = async (req, res) => {
    await User.find()
        .sort({ createdAt: -1 })
        .select('-__v')
        .then(users => {
            res.status(200).send({
                success: true,
                message: 'Users retrieved successfully',
                count: users.length,
                users: users,
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: 'Error fetching users',
                detailed_message: err.message,
            });
        });
};

const getUser = async (req, res) => {
    const { id } = req.params;
    await User.findById(id)
        .then(user => {
            if (!user) {
                res.status(200).send({
                    success: true,
                    message: 'User not found',
                    user: null,
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'User retrieved successfully',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        timestamp: user.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: 'Error fetching user',
                detailed_message: err.message,
            });
        });
};

export { getUser, listUsers };
