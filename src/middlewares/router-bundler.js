import userRouter from '../modules/User/user-router.js';
import cardRouter from '../modules/Card/card-router.js';
import cardTypeRouter from '../modules/CardType/card-type-router.js';
import authRouter from '../modules/Auth/auth-router.js';
import adminRouter from '../modules/Admin/admin-router.js';
import contactRouter from '../modules/Landing/contact-router.js';

const adminRoutes = [adminRouter];
const privateRoutes = [userRouter, cardRouter, cardTypeRouter];
const publicRoutes = [authRouter, contactRouter];

export { adminRoutes, privateRoutes, publicRoutes };
