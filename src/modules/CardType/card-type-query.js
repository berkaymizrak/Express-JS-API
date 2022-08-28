// Models
import CardType from './card-type-model.js';

const cardTypesFindQuery = async (filters = {}, projection = {}, sorting = { createdAt: -1 }) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };

    return await CardType.find(filters, { __v: 0, ...projection })
        .sort(sorting)
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

const cardTypeUpdateQuery = async (filters, update, projection = {}) => {
    return await CardType.findOneAndUpdate(filters, { new: true, projection: { __v: 0, ...projection } })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'Card type updated successfully' : 'Card type not found',
                data,
            };
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

const cardTypeDeleteQuery = async (filters, projection = {}) => {
    return await CardType.findOneAndDelete(filters, { projection: { __v: 0, ...projection } })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                message: data ? 'Card type deleted successfully' : 'Card type not found',
                data,
            };
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

export { cardTypeDeleteQuery, cardTypeCreateQuery, cardTypeUpdateQuery, cardTypesFindQuery };
