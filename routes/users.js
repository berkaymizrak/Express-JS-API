const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// Models
const User = require('../models/User');

/* GET users listing. */
router.get('/', (req, res, next) => {
    User.find((err, users) => {
        if (err) return next({ message: 'Error fetching users.', detailed_message: err.message });
        return res.json({
            status: 'success',
            message: 'Users retrieved successfully',
            count: users.length,
            data: users,
        });
    })
        .sort({ createdAt: -1 })
        .select('-__v');
});

router.get('/detailed', (req, res, next) => {
    User.aggregate(
        [
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
                $group: {
                    // _id: {
                    //     _id: '$_id',
                    //     name: '$name',
                    //     email: '$email',
                    //     createdAt: '$createdAt',
                    //     updatedAt: '$updatedAt'
                    // },
                    _id: '$_id',
                    username: { $first: '$username' },
                    name: { $first: '$name' },
                    surname: { $first: '$surname' },
                    email: { $first: '$email' },
                    password: { $first: '$password' },
                    phone: { $first: '$phone' },
                    address: { $first: '$address' },
                    city: { $first: '$city' },
                    state: { $first: '$state' },
                    zip: { $first: '$zip' },
                    country: { $first: '$country' },
                    active: { $first: '$active' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    cards: { $push: '$cards' },
                },
            },
            // {
            //     $project: {
            //         _id: '$_id._id',
            //         name: '$_id.name',
            //         email: '$_id.email',
            //         createdAt: '$_id.createdAt',
            //         updatedAt: '$_id.updatedAt',
            //         cards: '$cards'
            //     }
            // }
        ],
        (err, users) => {
            if (err) return next({ message: 'Error fetching users.', detailed_message: err.message });
            return res.json({
                status: 'success',
                message: 'Users retrieved successfully',
                count: users.length,
                data: users,
            });
        }
    );
});

router.get('/:id', (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
        if (err) return next({ message: 'User not found.', detailed_message: err.message });
        return res.json({
            status: 'success',
            message: 'User retrieved successfully',
            data: user,
        });
    }).select('-__v');
});

router.get('/detailed/:id', (req, res, next) => {
    User.aggregate(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.id),
                },
            },
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
                $group: {
                    _id: '$_id',
                    username: { $first: '$username' },
                    name: { $first: '$name' },
                    surname: { $first: '$surname' },
                    email: { $first: '$email' },
                    password: { $first: '$password' },
                    phone: { $first: '$phone' },
                    address: { $first: '$address' },
                    city: { $first: '$city' },
                    state: { $first: '$state' },
                    zip: { $first: '$zip' },
                    country: { $first: '$country' },
                    active: { $first: '$active' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    cards: { $push: '$cards' },
                },
            },
        ],
        (err, users) => {
            if (err) return next({ message: 'Error fetching users.', detailed_message: err.message });
            return res.json({
                status: 'success',
                message: 'Users retrieved successfully',
                count: users.length,
                data: users,
            });
        }
    );
});

router.put('/:id', (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
        if (err) return next({ message: 'Error updating user.', detailed_message: err.message });
        return res.json({
            status: 'success',
            message: 'User updated successfully',
            data: user,
        });
    }).select('-__v');
});

router.delete('/:id', (req, res, next) => {
    User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err) return next({ message: 'Error deleting user.', detailed_message: err.message });
        return res.json({
            status: 'success',
            message: 'User deleted successfully',
            data: user,
        });
    }).select('-__v');
});

module.exports = router;
