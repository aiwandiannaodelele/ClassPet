# 萌宠班级屋 (ClassPet) 🐾

一个基于 Next.js 15 和 Prisma 构建的班级管理与游戏化激励系统。通过让每个学生领养和培养自己的虚拟宠物，结合教师的日常加减分操作，实现寓教于乐的班级管理。

[![License](https://img.shields.io/badge/license-AGPL--3.0-orange?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue?style=flat-square)](https://github.com/aiwandiannaodelele/ClassPet/releases)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square)](https://tailwindcss.com/)

## ✨ 项目简介

**萌宠班级屋** 是一款面向中小学班级的游戏化管理工具。
学生领养虚拟宠物，教师通过日常表现加减分，宠物会随分数成长、升级、变化状态，让班级管理更有趣、更高效。

## 🎯 核心功能

### 1. 教师账户与数据隔离体系
- **NextAuth 鉴权**：完整 `next-auth@beta` 凭证登录体系。
- **多教师数据隔离**：班级与学生数据与教师账户强绑定，确保私密性。
- **个人资料自定义**：支持教师自定义称呼、Emoji 或本地上传头像。

### 2. PIN 码安全锁机制（防作弊系统）
- **独立安全锁**：可设置 4–6 位纯数字独立 PIN 码。
- **双重开关**：支持“设置锁”与“评分锁”，有效防止学生在白板端擅自操作。

### 3. 智能学生卡片
- **智能排序**：支持按学号数字排序或姓名拼音首字母排序（内置 `pinyin-pro`）。
- **游戏化视觉**：宠物以透明 WebP 形象展示，带等级 Lv、生命值 ❤️ 及状态徽章。
- **响应式布局**：底部控制台支持一键切换卡片尺寸（小/中/大）。

### 4. 游戏化评分与动效
- **喂食与惩罚**：教师通过“喂食”（加分）或“惩罚”（扣分）实时记录表现。
- **全屏视觉反馈**：成功操作触发纸屑、粒子特效，升级时拥有专属华丽动效。
- **一体化档案**：点击学生卡片直达档案中心，支持查看明细、撤回操作及重新领养。

### 5. 班级精品小商店
- **成长值购买力**：成长值直接作为货币，学生可兑换教师上架的虚拟或实物奖励。
- **批量兑换**：支持一次为多名学生兑换商品，内置余额自动校验。
- **完整账本**：独立存储每一笔兑换记录，确保存档有据可查。

### 6. 灵活分组管理
- **多方案并存**：支持座位分组、扫地分组等多套方案自由切换。
- **小组数据看板**：实时看板显示小组总分、生存率及成员健康状态。
- **全组激励**：支持针对整个小组进行一键快速“喂食”。

### 7. 生存与惩罚机制
- **饥饿衰减**：宠物长时间未加分会进入饥饿状态并扣除健康值（自动跳过周末）。
- **假期冻结**：寒暑假期间可开启冻结模式，宠物不衰减、不饿死。
- **阵亡与复活**：健康值归零或分数变负将导致宠物阵亡，需消耗成长值复活。

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: 支持 SQLite (开发) 与 PostgreSQL (生产)，通过 Prisma ORM 操作
- **鉴权**: Auth.js / NextAuth.js (v5 Beta)
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion + Canvas Confetti

## 💻 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
在项目根目录创建 `.env` 文件：
```env
DATABASE_URL="file:./dev.db" # 或者你的 PostgreSQL 字符串
AUTH_SECRET="your-random-secret-key"
```

### 3. 同步数据库
```bash
npx prisma db push
```

### 4. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 📄 开源协议

本项目基于 **GNU Affero General Public License v3.0 (AGPL-3.0)** 协议开源。

---
**开发者**：aiwandiannaodelele / 龚奕帆
**版本**: v1.0.0 (Release)
