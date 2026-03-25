const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.126.com',
  port: 465,
  secure: true,
  auth: {
    user: 'cnxgx@126.com',
    pass: 'DBeVz33w2M666uEj'
  }
});

transporter.sendMail({
  from: 'cnxgx@126.com',
  to: 'cnxgx@126.com',
  subject: 'Test from OpenClaw',
  text: 'Test message'
}, (err, info) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Email sent:', info.response);
  }
});
