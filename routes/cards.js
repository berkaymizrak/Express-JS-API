const express = require('express');
const router = express.Router();

// Models
const Card = require('../models/Card');

/* GET cards listing. */
router.get('/', (req, res, next) => {
    res.send({status: 'success', message: 'Welcome to the cards API'});
});

router.post('/', (req, res, next) => {
    const {name, icon} = req.body;

    const card = new Card({
        name: name,
        icon: icon
    });
    card.save((err, data) => {
        if (err) {
            return res.status(500).send({status: 'error', message: err.message});
        }
        return res.status(200).send({status: 'success', message: 'Card saved successfully', data: data});
    });
    /*const promise = card.save();
    promise.then(data => {
        return res.status(200).send({status: 'success', message: 'Card saved successfully', data: data});
    });
    promise.catch(err => {
        return res.status(500).send({status: 'error', message: err.message});
    });*/
});

module.exports = router;
