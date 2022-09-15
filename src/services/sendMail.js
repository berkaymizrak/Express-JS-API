import nodemailer from 'nodemailer';
import { env, fromEmail, mailAuth, mailService, __dirname } from '../config.js';
import path from 'path';
import pug from 'pug';
import Email from 'email-templates';

const transporter = nodemailer.createTransport({
    service: mailService,
    auth: mailAuth,
});

const sendMail = async mailOptions => {
    return await transporter
        .sendMail(mailOptions)
        .then(() => {
            return {
                status: 200,
                success: true,
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

const sendMailTemplate = async (to, subject, template, payload) => {
    const email = new Email({
        views: { root: path.join(__dirname, 'templates') },
        preview: env.development,
    });

    if (env.development) {
        return await email
            .send({
                message: {
                    from: fromEmail,
                    to,
                    subject,
                    html: await email.render(template, payload),
                },
            })
            .then(() => {
                return {
                    status: 200,
                    success: true,
                    mes: `Email sent successfully. ${payload.link}`,
                };
            })
            .catch(err => {
                return { mes: 'Error sending email', err };
            });
    } else {
        const mailOptions = {
            from: fromEmail,
            to,
            subject,
            html: await pug.renderFile(path.join(__dirname, 'templates', template + '.pug'), payload),
        };

        return await sendMail(mailOptions);
    }
};

export { sendMailPayload, sendMailTemplate };
