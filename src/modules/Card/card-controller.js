// Models
import Card from './card-model.js';

const listCards = async (req, res, next) => {
    await Card.find({}, { __v: 0 })
        .sort({ createdAt: -1 })
        .then(data => {
            return res.status(200).send({
                success: true,
                message: 'Cards retrieved successfully',
                count: data.length,
                data,
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

const listDetailedCards = async (req, res, next) => {
    await Card.aggregate([
        {
            $lookup: {
                from: 'cardtypes',
                localField: 'card_type_id',
                foreignField: '_id',
                as: 'cardtype',
            },
        },
        {
            $unwind: {
                path: '$cardtype',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $group: {
                _id: '$_id',
                root: { $mergeObjects: '$$ROOT' },
                cardtype: { $first: '$cardtype' },
            },
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$root', '$$ROOT'],
                },
            },
        },
        {
            $project: {
                root: 0,
                __v: 0,
                'cardtype.__v': 0,
                active: 0,
                'cardtype.active': 0,
            },
        },
    ])
        .sort({ createdAt: -1 })
        .then(data => {
            return res.status(200).send({
                success: true,
                message: 'Cards retrieved successfully',
                count: data.length,
                data,
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
    const data = new Card({
        name,
        user_id,
        card_type_id,
        url_path,
    });
    await data
        .save()
        .then(data => {
            return res.status(200).send({
                success: true,
                message: 'Card created successfully',
                data,
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
    await Card.findById({ _id: id }, { __v: 0 })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: 'Card not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card retrieved successfully',
                    data,
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
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: 'Card not found',
                    data: null,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card deleted successfully',
                    data,
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

export { listCards, listDetailedCards, createCard, getCard, deleteCard };
