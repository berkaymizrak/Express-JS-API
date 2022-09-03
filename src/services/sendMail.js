import nodemailer from 'nodemailer';
import { fromEmail, mailAuth, mailService } from '../config.js';
// import path from 'path';
// import fs from 'fs';

const transporter = nodemailer.createTransport({
    service: mailService,
    auth: mailAuth,
});

const sendMail = async mailOptions => {
    return await transporter
        .sendMail(mailOptions)
        .then(() => {
            return {
                success: true,
                status: 200,
                mes: 'Email sent successfully',
            };
        })
        .catch(err => {
            return { mes: 'Error sending email', err };
        });
};

const sendMailPayload = async (to, subject, text, html) => {
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

    return await sendMail(mailOptions);
};

const sendMailTemplete = async (to, subject, payload, template) => {
    const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
    const compiledTemplate = handlebars.compile(source);
    const mailOptions = {
        from: fromEmail,
        to: to,
        subject: subject,
        html: compiledTemplate(payload),
    };

    return await sendMail(mailOptions);
};

export { sendMailPayload, sendMailTemplete };
