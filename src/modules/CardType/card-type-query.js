// Models
import CardType from './card-type-model.js';

const cardTypesListQuery = async () => {
    return await CardType.find({}, { __v: 0 })
        .sort({ createdAt: -1 })
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Card Types retrieved successfully',
                count: data.length,
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching card types',
                detailed_message: err.message,
            };
        });
};

const cardTypeCreateQuery = async body => {
    const { name, icon, base_url } = body;
    return await new CardType({
        name,
        icon,
        base_url,
    })
        .save()
        .then(data => {
            return {
                status: 200,
                success: true,
                message: 'Card Type created successfully',
                data,
            };
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error creating card type',
                detailed_message: err.message,
            };
        });
};

const cardTypeGetQuery = async id => {
    return await CardType.findById({ _id: id }, { __v: 0 })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card type not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card type retrieved successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error fetching card type',
                detailed_message: err.message,
            };
        });
};

const cardTypeUpdateQuery = async id => {
    return await CardType.findByIdAndUpdate(id, { $new: true })
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card type not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card type updated successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error updating card type',
                detailed_message: err.message,
            };
        });
};

const cardTypeDeleteQuery = async id => {
    return await CardType.findOneAndDelete(id)
        .then(data => {
            if (!data) {
                return {
                    status: 200,
                    success: false,
                    message: 'Card type not found',
                };
            } else {
                return {
                    status: 200,
                    success: true,
                    message: 'Card type deleted successfully',
                    data,
                };
            }
        })
        .catch(err => {
            return {
                status: 500,
                success: false,
                message: 'Error deleting card type',
                detailed_message: err.message,
            };
        });
};

export {
    cardTypeDeleteQuery,
    cardTypeGetQuery,
    cardTypeCreateQuery,
    cardTypeUpdateQuery,
    cardTypesListQuery,
};
