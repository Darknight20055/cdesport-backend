// backend/services/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  try {
    console.log('📨 Tentative d\'envoi email à :', to);
    console.log('✉️ Sujet :', subject);

    const info = await transporter.sendMail({
      from: `"CDesport" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email envoyé ! ID Message :', info.messageId);

  } catch (error) {
    console.error('❌ Erreur envoi email :', error.message);
    throw new Error('Erreur lors de l’envoi de l’email. Vérifie ton SMTP.');
  }
}

module.exports = { sendMail };
