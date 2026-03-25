标题：关于OpenClaw配置每次启动后出现无效keys的问题

我在使用OpenClaw-CN时，每次重启Gateway后，配置文件openclaw.json都会出现以下无效配置项：

1. tools.sessions
2. commands.ownerDisplay  
3. gateway.controlUi.allowedOrigins

这些配置项在官方文档中已被标记为废弃（deprecated），但每次启动都会自动出现。

我已经尝试运行openclaw doctor --fix来修复，但重启后又会出现。

请问这是什么原因？如何彻底解决？

环境：
- OpenClaw-CN 0.1.8-fix.3
- Windows