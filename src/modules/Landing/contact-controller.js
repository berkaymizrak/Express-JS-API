import { fromEmail } from '../../config.js';
import { sendMailTemplate } from '../../services/sendMail.js';

const contactForm = async (req, res, next) => {
    const { name, email, message } = req.body;

    const mailPayload = { name, email, message };
    mailPayload.receiver = 'guest';
    await sendMailTemplate(email, res.__('contact_form_subject'), 'contactForm', mailPayload);
    mailPayload.receiver = 'owner';
    return next(
        await sendMailTemplate(fromEmail, 'New message from contact form', 'contactForm', mailPayload)
    );
};

export { contactForm };
