import express from 'express';
import { contactForm } from './contact-controller.js';

const contactRouter = express.Router();

contactRouter.post('/contact', contactForm);

export default contactRouter;
