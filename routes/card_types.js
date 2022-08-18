const express = require('express');
const router = express.Router();

// Models
const CardType = require('../models/CardType');

/* GET card_types listing. */
router.get('/', (req, res, next) => {
    CardType.find((err, card_types) => {
        if (err) return next({message: 'Error fetching card_types.', detailed_message: err.message});
        res.json({
            status: 'success',
            message: 'Card Types retrieved successfully',
            count: card_types.length,
            data: card_types
        });
    }).sort({createdAt: -1}).select('-__v');
});

router.post('/', (req, res, next) => {
    const {name, user_id, card_type_id, base_url} = req.body;

    const card_type = new CardType({name, user_id, card_type_id, base_url});
    card_type.save((err, card_type) => {
        if (err) return next({message: 'Error saving card_type.', detailed_message: err.message});
        return res.status(200).send({status: 'success', message: 'CardType saved successfully', data: card_type});
    });
});

router.get('/:id', (req, res, next) => {
    CardType.findById(req.params.id, (err, card_type) => {
        // if (err) return res.json({status: 'error', message: 'CardType not found.', detailed_message: err});
        if (err) return next({message: 'CardType not found.', detailed_message: err.message});
        res.json({status: 'success', message: 'CardType retrieved successfully', data: card_type});
    }).select('-__v');
});

router.put('/:id', (req, res, next) => {
    CardType.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, card_type) => {
        if (err) return next({message: 'Error updating card_type.', detailed_message: err.message});
        res.json({status: 'success', message: 'CardType updated successfully', data: card_type});
    }).select('-__v');
});

router.delete('/:id', (req, res, next) => {
    CardType.findByIdAndRemove(req.params.id, (err, card_type) => {
        if (err) return next({message: 'Error deleting card_type.', detailed_message: err.message});
        res.json({status: 'success', message: 'CardType deleted successfully', data: card_type});
    }).select('-__v');
});

module.exports = router;
