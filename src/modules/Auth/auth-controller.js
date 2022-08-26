import bcrypt from 'bcryptjs';
import User from '../User/user-model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config.js';

const createUser = async (req, res) => {
    const { username, name, surname, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return next({ message: 'Error hashing password', detailed_message: err.message });
        const user = new User({
            username,
            name,
            surname,
            email,
            password: hash,
        });
        user.save((err, user) => {
            if (err) return next({ message: 'Error saving user', detailed_message: err.message });
            return res.json({
                status: 'success',
                message: 'User saved successfully',
                data: user,
            });
        });
    });
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err) return next({ message: 'Error fetching user', detailed_message: err.message });
        if (!user) return next({ message: 'User not found', detailed_message: 'User not found.' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return next({ message: 'Error comparing password', detailed_message: err.message });
            if (!result)
                return next({
                    message: 'Password does not match',
                    detailed_message: 'Password does not match',
                });

            const payload = {
                username,
            };
            // const token = jwt.sign(payload, process.env.JWT_SECRET, {
            const token = jwt.sign(payload, JWT_SECRET, {
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
};

export { createUser, loginUser };
