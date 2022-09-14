import userRouter from '../modules/User/user-router.js';
import cardRouter from '../modules/Card/card-router.js';
import cardTypeRouter from '../modules/CardType/card-type-router.js';
import authRouter from '../modules/Auth/auth-router.js';
import contactRouter from '../modules/Landing/contact-router.js';

const privateRoutes = [userRouter, cardRouter, cardTypeRouter];
const publicRoutes = [authRouter, contactRouter];

export { privateRoutes, publicRoutes };
