import { resultLimit } from '../config.js';

const setPaginationParams = async (req, res, next) => {
    let { page, current_page_number = +page, size, limit = +size, sort } = req.query;

    // Calculate and set pagination params for query
    if (!current_page_number) current_page_number = 1;
    if (!limit) limit = resultLimit;
    const skip = (current_page_number - 1) * limit; // For page 1, the skip is: (1 - 1) * 20 => 0 * 20 = 0

    req.query.limit = limit;
    req.query.skip = skip;

    // Set sorting object for query
    let sorting = sort.replace(/ /g, '').split(',');
    sorting = sorting.map(item => {
        const [key, value] = item.split(':');
        return { [key]: value };
    });
    sorting = sorting.reduce((acc, item) => {
        return { ...acc, ...item };
    });
    req.query.sorting = sorting;

    // Calculate and set pagination params for response
    const previous_page_number = current_page_number > 1 ? current_page_number - 1 : null;
    const next_page_number = current_page_number + 1;

    req.query.current_page_number = current_page_number;
    req.query.previous_page_number = previous_page_number;
    req.query.next_page_number = next_page_number;

    return next();
};

export default setPaginationParams;
