const createPaging = (req, total_count) => {
    // Set pagination urls
    // Calculated req.query params are set in pagination-params.js
    let { current_page_number, previous_page_number, next_page_number, limit } = req.query;

    if (current_page_number === undefined) return undefined;

    const max_page_number = Math.ceil(total_count / limit);
    const basePage = req.protocol + '://' + req.get('host') + req.path;
    const current_page = basePage + '?page=' + current_page_number + '&limit=' + limit;

    const first_page = basePage + '?page=1&limit=' + limit;
    const last_page = basePage + '?page=' + max_page_number + '&limit=' + limit;

    next_page_number = max_page_number > current_page_number ? next_page_number : null;
    let next_page = next_page_number ? basePage + '?page=' + next_page_number + '&limit=' + limit : null;
    let previous_page = previous_page_number
        ? basePage + '?page=' + previous_page_number + '&limit=' + limit
        : null;

    const number = {
        previous_page_number,
        current_page_number,
        next_page_number,
        max_page_number,
    };

    return {
        first_page,
        previous_page,
        current_page,
        next_page,
        last_page,
        number,
    };
};

export default createPaging;
