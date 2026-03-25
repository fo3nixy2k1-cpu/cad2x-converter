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
  subject: '中国移动网络维护项目中标结果表格',
  text: '请查收附件中的Excel/CSV表格',
  attachments: [{
    filename: 'china_mobile_bidding.csv',
    path: 'C:\\Users\\y2k1\\.openclaw\\workspace\\china_mobile_bidding.csv'
  }]
}, (err, info) => {
  if (err) {
    console.log('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Email sent:', info.response);
  }
});
