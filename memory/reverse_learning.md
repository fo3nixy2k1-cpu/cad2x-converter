# 逆向学习完整笔记

## 一、工具安装 ✅
- x64dbg: C:\Users\y2k1\Downloads\snapshot_2025-08-19_19-40 (1)\release\x64\
- Ghidra: C:\ghidra\ghidra_12.0.4_PUBLIC
- Java 21: C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot

## 二、CrackMe 实战 ✅ (已破解)
- 密码: `52pojie!!!_2026_Happy_new_year!` (31字符)
- 思路: 字符串搜索 → 发现hint:length is key → 尝试不同长度 → 找到31 → 加!成功

## 三、汇编基础 (学习ing)

### 3.1 常见指令
| 指令 | 含义 | 示例 |
|------|------|------|
| mov | 赋值 | mov eax, 5 (eax=5) |
| add | 加法 | add eax, ebx (eax=eax+ebx) |
| sub | 减法 | sub eax, 1 (eax=eax-1) |
| cmp | 比较 | cmp eax, ebx (影响EFLAGS) |
| je/jz | 相等跳转 | je label (相等跳转) |
| jne/jnz | 不等跳转 | jne label (不等跳转) |
| jmp | 无条件跳转 | jmp label (跳转) |
| jg/jl | 大于/小于跳转 | jg label (大于跳转) |
| call | 调用函数 | call 0x401000 |
| ret | 返回 | ret (函数返回) |
| push | 入栈 | push eax |
| pop | 出栈 | pop eax |

### 3.2 寄存器
- **通用寄存器**: EAX, EBX, ECX, EDX (32位), AX, BX, CX, DX (16位), AL, BL, CL, DL (8位)
- **指针寄存器**: ESP (栈指针), EBP (基址指针), ESI (源索引), EDI (目标索引)
- **指令指针**: EIP (下一条指令地址)
- **标志寄存器**: EFLAGS (存储比较结果)

### 3.3 栈操作
- push: 入栈 (ESP减4)
- pop: 出栈 (ESP加4)
- call: 调用函数 (push返回地址, jmp到函数)
- ret: 返回 (pop返回地址)

### 3.4 调用约定
- **cdecl**: 参数从右到左入栈, 调用者清理栈
- **stdcall**: 参数从右到左入栈, 被调用者清理栈

## 四、x64dbg 调试技巧

### 4.1 快捷键
| 按键 | 功能 |
|------|------|
| F2 | 设置断点 |
| F7 | 单步步入 (进入函数) |
| F8 | 单步步过 (跳过函数) |
| F9 | 运行 |
| Ctrl+G | 跳转到地址 |
| Ctrl+F | 搜索命令 |
| Ctrl+B | 搜索字节 |
| Ctrl+F9 | 运行到返回 |

### 4.2 调试流程
1. 加载程序 (File → Open)
2. 搜索字符串 (Ctrl+B 搜索 "Wrong", "Correct")
3. 双击字符串跳转到引用位置
4. 在关键位置 F2 设置断点
5. F9 运行程序
6. 到达断点后 F7/F8 单步调试
7. 观察寄存器和内存变化

### 4.3 条件断点
右键断点 → Edit → Break Condition
例如: eax==1 (当eax=1时断下)

---

*学习日期：2026-03-13*
*来源: 52pojie, hello-ctf.com, 看雪论坛, CSDN*
