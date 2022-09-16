import cors from 'cors';
import { frontendUrl } from '../config.js';

const Cors = cors({
    origin: frontendUrl,
});

const middleWares = [Cors];
export default middleWares;
