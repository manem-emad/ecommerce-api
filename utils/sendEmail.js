const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Ecommerce API" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2>${subject}</h2>
                <p>${message}</p>
               </div>`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;