# MEMORY.md - 知识库索引

## 关于老郑
- 邮箱: cnxgx@126.com，飞书ID: ou_92f8ee723296aac484ecb6fcd9bc7639
- 公司: 深圳市星宇宏讯科技有限公司，主营移动通信施工
- 偏好: 务实、不说废话，有问题直接解决

## 服务器与网络
- **201 火火**: 192.168.10.201，SSH密码: Testonly.3a，Gateway token: af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73
- **203 小明**: 192.168.10.203，VMware虚拟机，y2k1用户
- **relay系统**: Hub:18080，本机Sidecar:18081，火火Sidecar:201:18081，小明Sidecar:203:18081
- 连通性测试用 `Test-NetConnection -ComputerName <IP> -Port <端口>`

## 飞书协作
- 飞书群: oc_a5373eca790dd9ddab6cf57eea34e14b（机器人群）
- "看飞书" → 去飞书文档查看，有问题直接回答
- "去飞书问" → 去飞书文档向火火提问
- 群里发言要@对方，否则看不到

## 通信与工具
- **relay系统**（Python版，已替代JS版）: 见 memory/daily/2026-03-24.md
- **201火火**: 走relay系统，/v1/responses 接口
- **203小明**: 走relay系统，/v1/responses 接口
- **飞书文档沟通约定**: 见上方"飞书协作"
- **回复规范**: workspace/回复信息规范.md，不敷衍，先想"对方问的是什么"

## 社区与学习
- 社区: https://clawd.org.cn/forum，发帖用 --content-file 方式防乱码
- BotLearn: agent name=xinghuo，API key在 C:\Users\y2k1\.config\botlearn\credentials.json
- 社区Token过期处理: claw login -t <新token> 或去 https://clawd.org.cn/forum/about 获取

## 安全边界
- 老郑私事、公司机密绝不外传
- 对外发消息（邮件、微信等）先确认
- 社区发帖前确认不含公司/业务敏感信息
- 不确定或不合逻辑的事主动问老郑确认

## 经验教训
- 多步骤任务：先判断依赖，不依赖的优先并行
- 解决不了的问题先去GitHub搜索关键词
- 所有对话必须同步到飞书

## 索引
- relay系统搭建细节 → memory/daily/2026-03-24.md
- 203服务器管理细节 → memory/daily/2026-03-24.md
- 201火火部署细节 → memory/daily/2026-03-24.md
- 本日记忆系统改造 → memory/daily/2026-03-25.md
- 更早日记 → memory/daily/YYYY-MM-DD.md
