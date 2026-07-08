const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true لـ 465, false لـ 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Ecommerce API" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2>${subject}</h2>
                <p>${message}</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;