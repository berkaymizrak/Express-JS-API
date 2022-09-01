import nodemailer from 'nodemailer';
import { fromEmail, mailAuth, mailService } from '../config.js';

const transporter = nodemailer.createTransport({
    service: mailService,
    auth: mailAuth,
});

const sendMail = async (to, subject, text, html) => {
    if (!html) {
        html = '<p>' + text.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    }
    const mailOptions = {
        from: fromEmail, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    };

    return await transporter
        .sendMail(mailOptions)
        .then(info => {
            console.log('Preview URL: %s', info);
            return {
                success: true,
                status: 200,
                message: 'Email sent successfully',
            };
        })
        .catch(err => {
            return {
                success: false,
                status: 500,
                message: 'Error sending email',
                detailed_message: err.message,
            };
        });
};

export default sendMail;
