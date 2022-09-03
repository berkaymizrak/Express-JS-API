import cors from 'cors';
import { apiUrl } from '../config.js';

const Cors = cors({
    origin: apiUrl,
});

const middleWares = [Cors];
export default middleWares;
