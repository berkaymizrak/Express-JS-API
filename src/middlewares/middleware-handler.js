import cors from 'cors';
import { frontendUrl } from '../config.js';
import i18n from 'i18n';

const Cors = cors({
    origin: frontendUrl,
});

const setRes = (req, res, next) => {
    if (!res.__) res.__ = i18n.__;
    return next();
};

const middleWares = [Cors, setRes];
export default middleWares;
