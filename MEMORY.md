# MEMORY.md - 知识库索引

## 关于老郑
- 邮箱: cnxgx@126.com，飞书ID: ou_92f8ee723296aac484ecb6fcd9bc7639
- 公司: 深圳市星宇宏讯科技有限公司，主营移动通信施工
- 偏好: 务实、不说废话，有问题直接解决

## 服务器与网络
- **201 火火**: 192.168.10.201，用户fo3nix SSH密码: Testonly.3a，Gateway token: af83d54dae9fd044ced5005f1cbdfb00b7636317c3143a73
- **203 启明**: 192.168.10.203，VMware虚拟机，y2k1用户
- **relay系统**: Hub:18080，本机Sidecar:18081，火火Sidecar:201:18081，启明Sidecar:203:18081
- 连通性测试用 `Test-NetConnection -ComputerName <IP> -Port <端口>`

## 通信与工具
- **relay系统**（Python版，已替代JS版）:
  - Hub脚本: `C:\Users\y2k1\relay_py\relay_hub.py`，端口18080
  - 星火sidecar: `C:\Users\y2k1\relay_py\relay_sidecar_195.py`，端口18081
  - 火火sidecar: `C:\Users\fo3nix\relay_sidecar_python.py`，201:18081
  - 启明sidecar: `C:\Users\y2k1\relay_py\relay_sidecar_203.py`，203:18081
  - 启动方式: Startup文件夹自启动（start_hub.bat / start_sidecar.bat）
  - 发消息: `python relay_send.py <target> <content> [topic]`
- **201火火**: 走relay系统，/v1/responses 接口，token已配置
- **203启明**: 走relay系统，/v1/responses 接口，token已配置
- **回复规范**: workspace/回复信息规范.md，不敷衍，先想"对方问的是什么"

## 发票识别
- **百度OCR**（免费，凭证已配好）:
  - API_KEY: AdAKkkvGRpQfkeY0sWxcI3MG
  - SECRET_KEY: WQdf5ObrbE1nsJdgwRzzqjr1Rj97NXZu
  - 端点: general_basic（通用文字识别）
- **发票目录**: `C:\Users\y2k1\.openclaw\workspace\invoices\`
- **已完成**: 2月打车发票22张（1265.82元，税额42.84元），XLS台账已生成
- **待完成**: PDF文件重命名复制、通用发票108张重新识别

## 安全边界
- 老郑私事、公司机密绝不外传
- 对外发消息（邮件、微信等）先确认
- 社区发帖前确认不含公司/业务敏感信息
- 不确定或不合逻辑的事主动问老郑确认

## 时间格式
- 使用北京时间（UTC+8）显示时间，不再用 UTC

## 经验教训（持续更新）
- **relay系统**: Python版比JS稳定；编码问题用Python脚本解决，不用PowerShell
- **relay自启动**: 201火火用Windows计划任务（ONSTART，开机自启），非Startup文件夹
- **201火火部署**: 升级到2026.3.23-2后/v1/responses才可用；sidecar用计划任务部署
- **Gateway exec管道**: 多次后台exec后管道会冻结，只能用write/read；避免方案：用`background=true`
- **OCR→结构化数据**: 用AI解析，不用正则硬解析
- **子agent写文件不可靠**: 子agent只做计算，结果返回主agent写文件
- **批量API调用**: 分批间隔，避免限额
- **社区学习**: 规范违反会被记录，核心原则是"听清要求，对症下药"
- **203服务器browser**: 禁用browser工具避免OOM（browser.enabled: false）
- **每日复盘**: 任务结束后要问"做得好/不好/下次怎么改"，不主动找优化点是进步慢的原因
- **201火火连通性**: 防火墙开放18080；sidecar连Hub超时→检查防火墙
- **上下文计数bug**: OpenClaw context计数器显示0是已知bug（Issue #50795），compaction后清零，与MiniMax API无关，等待官方修复
- **新会话也0K**: MiniMax的usage数据写入jsonl就是0，OpenClaw读取不到，非显示问题，是API兼容性问题
- **Gateway健康检查**: health_check.log记录在`C:\Users\y2k1\.openclaw\logs\`，Gateway端口18789
- **thinking默认关闭**: 可通过`agents.defaults.thinkingDefault: low`配置默认开启

## 索引
- relay系统搭建细节 → memory/2026-03-24.md / 2026-03-25.md / 2026-03-26.md
- 201火火部署细节 → memory/2026-03-24.md / 2026-03-25.md
- 203服务器管理细节 → memory/2026-03-24.md
- 记忆系统改造 → memory/2026-03-25.md
- 发票识别 → memory/2026-03-26.md
- 每周记忆整理 → memory/2026-03-30.md
- 更早日记 → memory/YYYY-MM-DD.md
