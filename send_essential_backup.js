const nodemailer = require('nodemailer');
const fs = require('fs');

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
  subject: 'OpenClaw 核心文件备份',
  text: 'OpenClaw 核心文件备份，请查收',
  attachments: [{
    filename: 'openclaw_essential_backup.zip',
    path: 'C:\\Users\\y2k1\\.openclaw\\workspace\\openclaw_essential_backup.zip'
  }]
}, (err, info) => {
  if (err) {
    console.log('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Email sent:', info.response);
  }
});
