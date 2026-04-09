# 🐾 萌宠班级屋 (ClassPet)

<p align="center">
  <img src="https://raw.githubusercontent.com/aiwandiannaodelele/ClassPet/refs/heads/main/public/logo.png" alt="ClassPet Logo" width="128">
</p>

<p align="center">
  基于 Next.js 15 + Prisma 的游戏化班级管理系统<br>
  领养虚拟宠物 · 教师实时评分 · 让班级管理更有趣
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-orange?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/version-v1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square" alt="Next.js">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square" alt="Tailwind CSS">
</p>

---

## ✨ 简介
**萌宠班级屋 (ClassPet)** 是面向中小学的游戏化班级激励工具。
学生领养并培养虚拟宠物，教师通过日常加减分影响宠物成长状态，让纪律管理、积分激励变得生动自然。

## 🎯 核心特性
- 🔐 **安全鉴权体系** — NextAuth 登录 + PIN 码防作弊双重保护
- 👥 **数据严格隔离** — 教师/班级/学生数据独立，隐私安全
- 🃏 **智能学生卡片** — 宠物形象、等级、生命值实时展示
- 🎮 **游戏化评分** — 加分扣分触发粒子动效，升级仪式感拉满
- 🏪 **班级积分商店** — 成长值可兑换奖励，完整兑换账本
- 📊 **灵活分组管理** — 多套分组方案 + 小组实时看板
- ⏳ **生存衰减机制** — 宠物会饥饿、衰减、阵亡与复活
- 📅 **假期自动冻结** — 周末/寒暑假不扣状态，更人性化

## 🛠️ 技术栈
- **框架**：Next.js 15 (App Router)
- **数据库**：SQLite / PostgreSQL + Prisma ORM
- **鉴权**：Auth.js (NextAuth v5)
- **UI**：Tailwind CSS + shadcn/ui
- **动画**：Framer Motion + Canvas Confetti

## 🚀 快速开始

```bash
npm install
```

创建 `.env`：
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret-key"
```

同步数据库：
```bash
npx prisma db push
```

启动开发服务器：
```bash
npm run dev
```

访问：http://localhost:3000

## 📄 开源协议
本项目基于 **GNU Affero General Public License v3.0 (AGPL-3.0)** 开源。
任何二次修改、商用、线上托管服务均需开源完整修改版本，禁止私自闭源抄袭。

---

**开发者**：aiwandiannaodelele / 龚奕帆
**版本**：v1.0.0
