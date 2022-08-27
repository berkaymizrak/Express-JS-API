// Models
import CardType from './card-type-model.js';

const listCardTypes = async (req, res, next) => {
    await CardType.find({}, { __v: 0 })
        .sort({ createdAt: -1 })
        .then(data => {
            return res.status(200).send({
                success: true,
                message: 'Card Types retrieved successfully',
                count: data.length,
                data,
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
    const data = new CardType({
        name,
        icon,
        base_url,
    });
    await data
        .save()
        .then(data => {
            return res.status(200).send({
                success: true,
                message: 'Card Type created successfully',
                data,
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
    await CardType.findById({ _id: id }, { __v: 0 })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: 'Card type not found',
                    data,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card type retrieved successfully',
                    data,
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
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: 'Card type not found',
                    data,
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: 'Card type deleted successfully',
                    data,
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
