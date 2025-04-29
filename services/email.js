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
    console.log('📨 Attempting to send email to:', to);
    console.log('✉️ Subject:', subject);

    const info = await transporter.sendMail({
      from: `"CDesport" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent! Message ID:', info.messageId);

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error('Failed to send email. Check your SMTP configuration.');
  }
}

module.exports = { sendMail };
