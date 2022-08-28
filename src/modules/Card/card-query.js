import Card from './card-model.js';
import mongoose from 'mongoose';

const cardListQuery = async () => {
    return await Card.find({}, { __v: 0 })
        .sort({ createdAt: -1 })
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Cards retrieved successfully',
                count: data.length,
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            };
        });
};

const cardListDetailedQuery = async id => {
    const extraQuery = [];
    if (id) {
        extraQuery.push({
            $match: { _id: mongoose.Types.ObjectId(id) },
        });
    }
    return await Card.aggregate(
        extraQuery.concat([
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
    )
        .sort({ createdAt: -1 })
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Cards retrieved successfully',
                count: data.length,
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching cards',
                detailed_message: err.message,
            };
        });
};

const cardCreateQuery = async body => {
    const { name, user_id, card_type_id, url_path } = body;
    return await new Card({
        name,
        user_id,
        card_type_id,
        url_path,
    })
        .save()
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Card created successfully',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error creating card',
                detailed_message: err.message,
            };
        });
};

const cardGetQuery = async id => {
    return await Card.findById({ _id: id }, { __v: 0 })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card retrieved successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching card',
                detailed_message: err.message,
            };
        });
};

const cardUpdateQuery = async id => {
    return await Card.findByIdAndUpdate(id, { $new: true })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card updated successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting card',
                detailed_message: err.message,
            };
        });
};

const cardDeleteQuery = async id => {
    return await Card.findOneAndDelete(id)
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card deleted successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting card',
                detailed_message: err.message,
            };
        });
};

export {
    cardListQuery,
    cardListDetailedQuery,
    cardCreateQuery,
    cardGetQuery,
    cardUpdateQuery,
    cardDeleteQuery,
};
