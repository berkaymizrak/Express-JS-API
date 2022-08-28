import { resultLimit } from '../config.js';

const setPaginationParams = async (req, res, next) => {
    let { page, PAGE_NUMBER = +page, size, LIMIT = +size, sort } = req.query;

    // Calculate and set pagination params for query
    if (!PAGE_NUMBER) PAGE_NUMBER = 1;
    if (!LIMIT) LIMIT = resultLimit;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT; // For page 1, the skip is: (1 - 1) * 20 => 0 * 20 = 0

    req.query.limit = LIMIT;
    req.query.skip = SKIP;

    // Calculate and set pagination params for response
    const previous_page_number = PAGE_NUMBER - 1;
    const next_page_number = PAGE_NUMBER + 1;

    req.query.current_page_number = PAGE_NUMBER;
    req.query.previous_page_number = previous_page_number;
    req.query.next_page_number = next_page_number;

    return next();
};

export default setPaginationParams;
