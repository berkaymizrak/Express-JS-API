const express = require('express');
const router = express.Router();

// Models
const Card = require('../models/Card');

/* GET cards listing. */
router.get('/', (req, res, next) => {
    Card.find((err, cards) => {
        if (err) return next({message: 'Error fetching cards.', detailed_message: err.message});
        res.json({status: 'success', message: 'Cards retrieved successfully', count: cards.length, data: cards});
    }).sort({createdAt: -1});
});

router.post('/', (req, res, next) => {
    const {name, icon} = req.body;

    const card = new Card({
        name: name,
        icon: icon
    });
    card.save((err, card) => {
        if (err) {
            return res.status(500).send({status: 'error', message: err.message});
        }
        return res.status(200).send({status: 'success', message: 'Card saved successfully', data: card});
    });
});

router.get('/:id', (req, res, next) => {
    Card.findById(req.params.id, (err, card) => {
        // if (err) return res.json({status: 'error', message: 'Card not found.', detailed_message: err});
        if (err) return next({message: 'Card not found.', detailed_message: err.message});
        res.json({status: 'success', message: 'Card retrieved successfully', data: card});
    });
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
