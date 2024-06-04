const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }
    async sendActivationMail(email, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Активация аккаунта networth',
            text: '',
            html: `
                <div>
                    <h1>Для активации аккаунта перейдите по ссылке</h1>
                    <a href='${link}'>${link}</a>
                </div>
            `
        });
    }
    async sendCode(email, code) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: `Подтвердите почту ${email}`,
            text: '',
            html: `
                <div>
                    <h1>Подтвердите почту указав этот код в модалочке</h1>
                    <span>${code}</span>
                    <div>Не с уважение бот из networth</div>
                </div>
            `
        });
    }
}

module.exports = new MailService();