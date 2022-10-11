import users from './user-model.js';
import { defaultPPKey, defaultPPPath, resultLimit } from '../../config.js';

const userFindQuery = async (res, queryParams, { filters, projection, sorting, limit, skip }) => {
    // EXAMPLE
    // const filters = {
    //     // REGEX:
    //     username: /.*mizrak.*/,
    //     email: /.*test_includes_value.*/,
    //     active: true
    // };
    if (!filters) filters = {};
    if (!projection) projection = { __v: 0, password: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await users
        .find(filters, projection)
        .sort(sorting)
        .limit(limit)
        .skip(skip)
        .then(async data => {
            return await users.count(filters).then(totalCount => {
                return {
                    status: 200,
                    success: !!data,
                    mes: data
                        ? res.__('module_retrieved_successfully', { module: res.__('Users') })
                        : res.__('no_module_found', { module: res.__('user') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: res.__('error_fetching_module', { module: res.__('users') }), error };
        });
};

const userFindDetailedQuery = async (
    res,
    queryParams,
    { filters, countFilters, projection, sorting, limit, skip }
) => {
    // EXAMPLE
    // const filters = [
    //     {
    //         $match: { _id: mongoose.Types.ObjectId(id) },
    //     },
    //     {
    //         // REGEX:
    //         $match: { username: /.*mizrak.*/ },
    //     },
    //     {
    //         $match: { email: /.*localhost.com.*/ },
    //     },
    //     {
    //         username: { $in: [ 'berkay', 'mizrak' ] }
    //     },
    // ];
    if (!filters) filters = [];
    if (!countFilters) countFilters = {};
    if (!projection) projection = { password: 0 };
    if (!sorting) sorting = queryParams.sorting || { createdAt: -1 };
    if (!limit) limit = queryParams.limit || resultLimit;
    if (!skip) skip = queryParams.skip || 0;

    return await users
        .aggregate([
            ...filters,
            {
                $lookup: {
                    from: 'cards',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'cards',
                },
            },
            {
                $unwind: {
                    path: '$cards',
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $lookup: {
                    from: 'cardtypes',
                    localField: 'cards.cardTypeId',
                    foreignField: '_id',
                    as: 'cards.cardtype',
                },
            },
            {
                $unwind: {
                    path: '$cards.cardtype',
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $group: {
                    _id: '$_id',
                    root: { $mergeObjects: '$$ROOT' },
                    cards: { $push: '$cards' },
                },
            },
            {
                $addFields: {
                    cards: {
                        $filter: {
                            input: '$cards',
                            cond: { $ifNull: ['$$this._id', false] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    cardCount: { $size: '$cards' },
                    fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$root', '$$ROOT'],
                    },
                },
            },
            { $limit: limit },
            { $skip: skip },
            {
                $project: {
                    // Hide selected columns from the response
                    root: 0,
                    __v: 0,
                    'cards.__v': 0,
                    'cards.cardtype.__v': 0,
                    active: 0,
                    'cards.active': 0,
                    'cards.cardtype.active': 0,
                    ...projection,
                },
            },
        ])
        .sort(sorting)
        .then(async data => {
            for await (const obj of data) {
                if (!obj.profilePictureLocation) {
                    obj.profilePictureLocation = defaultPPPath;
                    obj.profilePictureKey = defaultPPKey;
                }
            }
            return data;
        })
        .then(async data => {
            return await users.count(countFilters).then(totalCount => {
                return {
                    status: 200,
                    success: !!data,
                    mes: data
                        ? res.__('module_retrieved_successfully', { module: res.__('Users') })
                        : res.__('no_module_found', { module: res.__('user') }),
                    totalCount,
                    count: data.length,
                    data,
                };
            });
        })
        .catch(error => {
            return { mes: res.__('error_fetching_module', { module: res.__('users') }), error };
        });
};

const userCreateQuery = async (res, body) => {
    const { username, firstName, lastName, email, password, role } = body;
    return await new users({
        username,
        firstName,
        lastName,
        email,
        password,
        role,
    })
        .save()
        .then(data => {
            return {
                status: 201,
                success: true,
                mes: res.__('module_created', { module: res.__('User') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_creating_module', { module: res.__('user') }), error };
        });
};

const userUpdateQuery = async (res, filters, update, projection = { __v: 0, password: 0 }) => {
    return await users
        .findOneAndUpdate(filters, update, {
            new: true,
            projection: projection,
        })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_updated', { module: res.__('User') })
                    : res.__('module_not_found', { module: res.__('User') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_updating_module', { module: res.__('user') }), error };
        });
};

const userDeleteQuery = async (res, filters, projection = { __v: 0, password: 0 }) => {
    return await users
        .findOneAndDelete(filters, { projection: projection })
        .then(data => {
            return {
                status: 200,
                success: !!data,
                mes: data
                    ? res.__('module_deleted', { module: res.__('User') })
                    : res.__('module_not_found', { module: res.__('User') }),
                data,
            };
        })
        .catch(error => {
            return { mes: res.__('error_deleting_module', { module: res.__('user') }), error };
        });
};

export { userFindQuery, userFindDetailedQuery, userCreateQuery, userUpdateQuery, userDeleteQuery };
