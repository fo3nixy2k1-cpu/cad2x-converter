const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.126.com',
  port: 465,
  secure: true,
  auth: {
    user: 'cnxgx@126.com',
    pass: 'Testonly.1a'
  }
});

const zipPath = 'C:\\Users\\y2k1\\relay_system.zip';
const docPath = 'C:\\Users\\y2k1\\relay_system_readme.txt';

const readme = `
Relay Hub 通信系统 - 使用说明
================================

一、系统架构
------------
本系统用于在启明服务器（195/201/203）之间建立可靠的命令中继通信。

架构组成：
  - Relay Hub（主控节点，部署在 195 服务器）
    位置：C:\\Users\\y2k1\\relay_hub.js
    端口：18080
    作用：消息路由、结果汇总、命令循环下发

  - Sidecar（各节点部署，部署在 201 和 203 服务器）
    位置：各服务器的 relay_sidecar.js
    端口：18081
    作用：执行 shell 命令、写回结果

二、工作流程
------------
1. 195 发起命令 -> POST /relay -> Relay Hub
2. Relay Hub 通过循环（最多5轮）将命令下发到各 Sidecar
3. Sidecar 执行 shell 命令，将结果 POST /result 返回
4. Relay Hub 汇总结果，通过协议指示灯告知发起方
5. 发起方收到结果或超时（通过 /result 回调）

三、关键文件
------------
- relay_hub.js    ：Relay Hub 主程序（195 服务器）
- relay_sidecar.js：Sidecar 程序（201/203 服务器）
- relay_system.zip：打包文件（含以上两个文件）

四、验证成功的功能
------------------
- 消息传递（-> Relay /relay）
- Shell 命令执行（-> Sidecar）
- 结果写回（-> /result）
- AI 响应（-> /v1/responses）
- Relay 协议指示灯

五、当前状态
-------------
- Relay Hub：运行中（http://192.168.10.195:18080）
- 201 Sidecar：已部署，端口 18081
- 203 Sidecar：已部署，端口 18081
- Gateway Token：已缓存

六、注意事项
-------------
- Sidecar 需要能访问 Gateway 获取 AI 响应
- 命令超时时间由各节点自行控制
- 建议定期检查各节点健康状态
`;

fs.writeFileSync(docPath, readme);

const mailOptions = {
  from: 'cnxgx@126.com',
  to: 'cnxgx@126.com',
  subject: 'Relay Hub 通信系统 - 打包文件 + 详细说明',
  text: readme,
  attachments: [
    {
      filename: 'relay_system.zip',
      path: zipPath
    },
    {
      filename: 'relay_system_readme.txt',
      path: docPath
    }
  ]
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('发送失败:', err);
    process.exit(1);
  } else {
    console.log('发送成功:', info.response);
    process.exit(0);
  }
});
