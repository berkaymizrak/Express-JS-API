// Models
import Card from './card-model.js';
import CardType from '../CardType/card-type-model.js';

const listCards = async (req, res) => {
    await Card.find()
        .sort({ createdAt: -1 })
        .select('-__v')
        .then(cards => {
            res.status(200).send({
                success: true,
                message: 'Cards retrieved successfully',
                count: cards.length,
                users: cards,
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            });
        });
};

const getCard = async (req, res) => {
    const { id } = req.params;
    await Card.findById(id)
        .then(card => {
            if (!card) {
                res.status(200).send({
                    success: true,
                    message: 'Card not found',
                    card: null,
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Card retrieved successfully',
                    card: {
                        _id: card._id,
                        name: card.name,
                        email: card.email,
                        timestamp: card.timestamp,
                    },
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: 'Error fetching card',
                detailed_message: err.message,
            });
        });
};

export { listCards, getCard };
