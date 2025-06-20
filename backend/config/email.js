const nodemailer = require('nodemailer');

// Email configuration (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || '9999wanu@gmail.com',
    pass: process.env.EMAIL_PASS || '123456789'
  }
});

module.exports = transporter;