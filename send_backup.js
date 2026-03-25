const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.126.com',
  port: 465,
  secure: true,
  auth: {
    user: 'cnxgx@126.com',
    pass: 'DBeVz33w2M666uEj'
  }
});

// Get today's date
const today = new Date().toISOString().split('T')[0];
const zipPath = `C:\\Users\\y2k1\\.openclaw\\workspace\\openclaw_config_backup_${today}.zip`;

// Create backup first
const { execSync } = require('child_process');
const backupDir = 'C:\\Users\\y2k1\\.openclaw\\workspace\\backup_temp';

// Clean and create backup dir
try {
  execSync(`if exist "${backupDir}" rmdir /s /q "${backupDir}"`, { shell: 'cmd' });
  execSync(`mkdir "${backupDir}"`, { shell: 'cmd' });
} catch (e) {}

// Files to backup
const files = [
  'C:\\Users\\y2k1\\.openclaw\\workspace\\SOUL.md',
  'C:\\Users\\y2k1\\.openclaw\\workspace\\USER.md',
  'C:\\Users\\y2k1\\.openclaw\\workspace\\IDENTITY.md',
  'C:\\Users\\y2k1\\.openclaw\\workspace\\AGENTS.md',
  'C:\\Users\\y2k1\\.openclaw\\workspace\\MEMORY.md',
  'C:\\Users\\y2k1\\.openclaw\\openclaw.json'
];

// Copy files
files.forEach(f => {
  try {
    if (fs.existsSync(f)) {
      const dest = path.join(backupDir, path.basename(f));
      fs.copyFileSync(f, dest);
    }
  } catch (e) {}
});

// Create zip
try {
  execSync(`powershell -Command "Compress-Archive -Path '${backupDir}\\*' -DestinationPath '${zipPath}' -Force"`, { shell: 'cmd' });
} catch (e) {}

// Send email
const mailOptions = {
  from: 'cnxgx@126.com',
  to: 'cnxgx@126.com',
  subject: `OpenClaw Config Backup ${today}`,
  text: 'OpenClaw configuration backup',
  attachments: []
};

if (fs.existsSync(zipPath)) {
  mailOptions.attachments.push({
    filename: `openclaw_config_backup_${today}.zip`,
    path: zipPath
  });
}

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Email sent:', info.response);
    // Cleanup
    try {
      fs.unlinkSync(zipPath);
      execSync(`rmdir /s /q "${backupDir}"`, { shell: 'cmd' });
    } catch (e) {}
  }
});
