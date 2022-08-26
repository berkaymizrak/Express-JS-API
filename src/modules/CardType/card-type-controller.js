// Models
import Card from '../Card/card-model.js';
import User from '../User/user-model.js';
import CardType from './card-type-model.js';

const listCardTypes = async (req, res, next) => {
    await CardType.find()
        .sort({ createdAt: -1 })
        .select('-__v')
        .then(cardTypes => {
            return res.status(200).send({
                success: true,
                message: 'Card Types retrieved successfully',
                count: cardTypes.length,
                data: cardTypes,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching card types',
                detailed_message: err.message,
            });
        });
};

const createCardType = async (req, res, next) => {
    const { name, icon, base_url } = req.body;
    const card_type = new CardType({
        name,
        icon,
        base_url,
    });
    await card_type
        .save()
        .then(card_type => {
            return res.status(200).send({
                success: true,
                message: 'Card Type created successfully',
                data: card_type,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error creating card type',
                detailed_message: err.message,
            });
        });
};

const getCardType = async (req, res, next) => {
    const { id } = req.params;
    await CardType.findById(id)
        .then(card_type => {
            if (!card_type) {
                return res.status(200).send({
                    success: false,
                    message: 'Card type not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card type retrieved successfully',
                    data: {
                        _id: card_type._id,
                        name: card_type.name,
                        email: card_type.email,
                        timestamp: card_type.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching card type',
                detailed_message: err.message,
            });
        });
};

const deleteCardType = async (req, res, next) => {
    const { id } = req.params;
    await CardType.findOneAndDelete(id)
        .then(card_type => {
            if (!card_type) {
                return res.status(200).send({
                    success: false,
                    message: 'Card type not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card type deleted successfully',
                    data: {
                        _id: card_type._id,
                        name: card_type.name,
                        email: card_type.email,
                        timestamp: card_type.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error deleting card type',
                detailed_message: err.message,
            });
        });
};

export { listCardTypes, createCardType, getCardType, deleteCardType };
