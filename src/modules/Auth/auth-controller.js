import bcrypt from 'bcryptjs';
import User from '../User/user-model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ALGORITHM, JWT_REFRESH_ALGORITHM } from '../../config.js';

function createToken(username, algorithm, expiresIn) {
    const payload = {
        username,
    };
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: algorithm,
        expiresIn: expiresIn,
    });
}

const createUser = async (req, res, next) => {
    const { username, name, surname, email, password } = req.body;

    await User.find({ $or: [{ username }, { email }] })
        .limit(1)
        .then(checkedUser => {
            if (checkedUser.length > 0) {
                return next({
                    status: 409,
                    success: false,
                    message: 'User is already exists',
                });
            }

            const newUser = new User({
                username,
                name,
                surname,
                email,
                password,
            });
            newUser.save((err, user) => {
                if (err) {
                    return next({
                        status: 500,
                        success: false,
                        message: 'Error creating user',
                        detailed_message: err, // TODO check err or err.message
                    });
                } else {
                    const { _id: id, username, name, surname, email } = user;
                    return res.status(201).send({
                        success: true,
                        message: 'User created successfully',
                        data: {
                            id,
                            username,
                            name,
                            surname,
                            email,
                        },
                        credentials: {
                            tokenType: 'Bearer',
                            accessToken: createToken(username, JWT_ALGORITHM, '6h'),
                            refreshToken: createToken(username, JWT_REFRESH_ALGORITHM, '1d'),
                        },
                    });
                }
            });
        })
        .catch(err => {
            next({
                status: 500,
                success: false,
                message: 'Error creating user',
                detailed_message: err.message,
            });
        });
};

const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    User.findOne({ username }).then(user => {
        if (!user)
            return next({
                status: 401,
                success: false,
                message: 'Incorrect Password or Username',
            });
        bcrypt.compare(password, user.password, (err, result) => {
            if (err)
                return next({
                    status: 500,
                    success: false,
                    message: 'Error comparing password',
                    detailed_message: err.message,
                });
            if (!result)
                return next({
                    status: 401,
                    success: false,
                    message: 'Incorrect Password or Username',
                });

            return res.status(200).send({
                success: true,
                message: 'User logged in successfully',
                data: user,
                credentials: {
                    tokenType: 'Bearer',
                    accessToken: createToken(username, JWT_ALGORITHM, '6h'),
                    refreshToken: createToken(username, JWT_REFRESH_ALGORITHM, '1d'),
                },
            });
        });
    });
};

export { createUser, loginUser };
