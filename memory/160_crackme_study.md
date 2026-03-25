# 52pojie 160个CrackMe系统学习笔记

## 学习目标
系统学习160个CrackMe，掌握逆向破解技能

## CrackMe清单 (001-160)

### 基础入门 (001-020)
| 编号 | 名称 | 类型 | 难度 | 状态 |
|------|------|------|------|------|
| 001 | Acid burn | 字符串搜索 | ⭐ | 🔄学习ing |
| 002 | Afkayas.1 | 注册机 | ⭐ | ⬜ |
| 003 | AfKayAs.2 | 算法分析 | ⭐ | ⬜ |
| 004 | ajj.1 | 简单验证 | ⭐ | ⬜ |
| 005 | ajj.2 | 简单验证 | ⭐ | ⬜ |
| 006 | aLoNg3x.1 | - | ⭐ | ⬜ |
| 007 | aLoNg3x.2 | - | ⭐ | ⬜ |
| 008 | Andr...al | VB程序 | ⭐ | ⬜ |
| 009 | Andr...al2 | VB算法 | ⭐ | ⬜ |
| 010 | Andr...al3 | VB算法 | ⭐ | ⬜ |

## 001 Acid burn 分析笔记 ✅

### 程序信息
- 类型: Windows GUI程序
- 语言: Delphi/VC++
- 特点: 经典入门级CrackMe

### 破解思路
1. 运行程序，弹出Nag窗口（欢迎界面）
2. 进入主界面，有用户名和密码输入
3. 搜索字符串 "Try Again" 或 "Correct"
4. 找到关键跳转发
5. 修改代码或找到注册码

### 关键技巧
- 字符串搜索 (Ctrl+B)
- MessageBox API 断点
- 关键跳转发修改 (JE/JNE)

---

## 002 Afkayas.1 ✅
- 类型: Name/Serial验证
- 技巧: 字符串搜索 + API断点

## 003 AfKayAs.2 ✅
- 类型: 算法分析
- 重点: 注册机编写

## 004 ajj.1 ✅
- 类型: 简单验证

## 005 ajj.2 ✅
- 类型: 序列号验证

## 006 aLoNg3x.1 ✅

## 007 aLoNg3x.2 ✅

## 008 Andr...al ✅
- 类型: VB程序

## 009 Andr...al2 ✅
- 类型: VB算法

## 010 Andr...al3 ✅
- 类型: VB算法

## 011-020 进阶
- 011: 简单验证
- 012: NE程序
- 013: badboy
- 014: bjanes
- 015: blaster99
- 016: BJCM20A
- 017: BJCM30A
- 018: Brad Soblesky.1 (简单)
- 019: Brad Soblesky.2
- 020: BuLLeT.8

## 021-030 中级
- 021: Brad Soblesky.2
- 022: CarLitoZ.1
- 023: Chafe.1
- 024: Chafe.2
- 025: CodeZero.1
- 026: Colormaster
- 027: Cosh.1
- 028: CoSH.2
- 029: CoSH.3
- 030: cracking4all.1

## 技巧进阶
- 1. 弹窗拦截 (MessageBoxA断点)
- 2. 暗桩检测 (自校验)
- 3. 花指令识别
- 4. 简单混淆应对

---

*开始日期: 2026-03-13*
