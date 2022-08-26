// Models
import Card from './card-model.js';
import CardType from '../CardType/card-type-model.js';
import User from '../User/user-model.js';

const listCards = async (req, res, next) => {
    await Card.find()
        .sort({ createdAt: -1 })
        .select('-__v')
        .then(cards => {
            return res.status(200).send({
                success: true,
                message: 'Cards retrieved successfully',
                count: cards.length,
                data: cards,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            });
        });
};

const createCard = async (req, res, next) => {
    const { name, user_id, card_type_id, url_path } = req.body;
    const card = new Card({
        name,
        user_id,
        card_type_id,
        url_path,
    });
    await card
        .save()
        .then(card => {
            return res.status(200).send({
                success: true,
                message: 'Card created successfully',
                data: card,
            });
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error creating card',
                detailed_message: err.message,
            });
        });
};

const getCard = async (req, res, next) => {
    const { id } = req.params;
    await Card.findById(id)
        .then(card => {
            if (!card) {
                return res.status(200).send({
                    success: false,
                    message: 'Card not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card retrieved successfully',
                    data: {
                        _id: card._id,
                        name: card.name,
                        email: card.email,
                        timestamp: card.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error fetching card',
                detailed_message: err.message,
            });
        });
};

const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    await Card.findOneAndDelete(id)
        .then(card => {
            if (!card) {
                return res.status(200).send({
                    success: false,
                    message: 'Card not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card deleted successfully',
                    data: {
                        _id: card._id,
                        name: card.name,
                        email: card.email,
                        timestamp: card.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            return next({
                status: 500,
                success: false,
                message: 'Error deleting card',
                detailed_message: err.message,
            });
        });
};

export { listCards, createCard, getCard, deleteCard };
