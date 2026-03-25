## 2026-03-23 18:08 CST | Gateway: DEAD

- **Chrome进程:** 7
- **Node进程:** 4  
- **句柄数:** 381
- **内存:** 485MB
- **CPU:** 84% (高)
- **诊断:** HTTP无响应但指标正常 → 疑似死锁/死循环
- **根因:** 未知

---
## 2026-03-23 17:37:07

| 指标 | 值 |
|------|-----|
| 网关状态 | **DEAD** |
| 根因 | 指标正常但HTTP无响应 → 死循环/死锁 |
| PID | 7192 |
| 线程数 | 31 |
| Handles | 376 |
| 内存 | 507MB |
| CPU | 17.59% |
| Chrome连接 | 7 |
| Node连接 | 4 |
| TIME_WAIT | 0 |
| FIN_WAIT2 | 1 |
| CLOSE_WAIT | 0 |

> ?? 网关进程存活但HTTP无响应，疑似死循环或死锁

---

## 2026-03-23 17:46:44

| 指标 | 值 |
|------|-----|
| 网关状态 | **DEAD** |
| 根因 | 指标正常但HTTP无响应 → 死循环/死锁 |
| PID | 7192 |
| 线程数 | 30 |
| Handles | 381 |
| 内存 | 607MB |
| CPU | 40.67% |
| Chrome连接 | 7 |
| Node连接 | 4 |
| TIME_WAIT | 0 |
| FIN_WAIT2 | 0 |
| CLOSE_WAIT | 0 |

> ?? 网关进程仍然存活但HTTP无响应，CPU占用升高(40.67%)，已持续约10分钟无响应



## 2026-03-24 13:38

- **Status:** OK
- **Chrome:** 8 | **Node:** 3 | **Handles:** 385 | **Mem:** 828MB | **PID:** 7176
- **Connections:** ESTABLISHED=0 TIME_WAIT=0 CLOSE_WAIT=0 FIN_WAIT2=1
