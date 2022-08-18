const express = require('express');
const router = express.Router();

// Models
const Card = require('../models/Card');

/* GET cards listing. */
router.get('/', (req, res, next) => {
    Card.find((err, cards) => {
        if (err) return next({message: 'Error fetching cards.', detailed_message: err.message});
        res.json({
            status: 'success',
            message: 'Cards retrieved successfully',
            count: cards.length,
            data: cards
        });
    }).sort({createdAt: -1}).select('-__v');
});

router.get('/detailed', (req, res, next) => {
    Card.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'users'
            }
        },
        {
            $unwind: {
                path: '$users',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                name: {$first: '$name'},
                user_id: {$first: '$user_id'},
                card_type_id: {$first: '$card_type_id'},
                url_path: {$first: '$url_path'},
                active: {$first: '$active'},
                createdAt: {$first: '$createdAt'},
                updatedAt: {$first: '$updatedAt'},
                users: {$push: '$users'}
            }
        },
    ], (err, users) => {
        if (err) return next({message: 'Error fetching users.', detailed_message: err.message});
        res.json({
            status: 'success',
            message: 'Users retrieved successfully',
            count: users.length,
            data: users
        });
    });
});

router.post('/', (req, res, next) => {
    const {name, user_id, card_type_id, url_path} = req.body;

    const card = new Card({name, user_id, card_type_id, url_path});
    card.save((err, card) => {
        if (err) return next({message: 'Error saving card.', detailed_message: err.message});
        return res.status(200).send({status: 'success', message: 'Card saved successfully', data: card});
    });
});

router.get('/:id', (req, res, next) => {
    Card.findById(req.params.id, (err, card) => {
        if (err) return next({message: 'Card not found.', detailed_message: err.message});
        res.json({status: 'success', message: 'Card retrieved successfully', data: card});
    }).select('-__v');
});

router.put('/:id', (req, res, next) => {
    Card.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, card) => {
        if (err) return next({message: 'Error updating card.', detailed_message: err.message});
        res.json({status: 'success', message: 'Card updated successfully', data: card});
    }).select('-__v');
});

router.delete('/:id', (req, res, next) => {
    Card.findByIdAndRemove(req.params.id, (err, card) => {
        if (err) return next({message: 'Error deleting card.', detailed_message: err.message});
        res.json({status: 'success', message: 'Card deleted successfully', data: card});
    }).select('-__v');
});

module.exports = router;
