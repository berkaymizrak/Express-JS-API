const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('../Structures/User/models/User');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Express' });
});

router.post('/register', (req, res, next) => {
    const { username, name, surname, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return next({ message: 'Error hashing password.', detailed_message: err.message });
        const user = new User({
            username,
            name,
            surname,
            email,
            password: hash,
        });
        user.save((err, user) => {
            if (err) return next({ message: 'Error saving user.', detailed_message: err.message });
            return res.json({
                status: 'success',
                message: 'User saved successfully',
                data: user,
            });
        });
    });
});

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err) return next({ message: 'Error fetching user.', detailed_message: err.message });
        if (!user) return next({ message: 'User not found.', detailed_message: 'User not found.' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return next({ message: 'Error comparing password.', detailed_message: err.message });
            if (!result)
                return next({
                    message: 'Password does not match.',
                    detailed_message: 'Password does not match.',
                });

            const payload = {
                username,
            };
            // const token = jwt.sign(payload, process.env.JWT_SECRET, {
            const token = jwt.sign(payload, req.app.get('JWT_SECRET'), {
                expiresIn: 720, // 12 hours
            });

            return res.json({
                status: 'success',
                message: 'User logged in successfully',
                data: user,
                token,
            });
        });
    }).select('-__v');
});

module.exports = router;
