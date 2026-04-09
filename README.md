<p align="center">
  <img src="https://raw.githubusercontent.com/aiwandiannaodelele/ClassPet/refs/heads/main/public/logo.png" alt="ClassPet Logo" width="128">
</p>

<h1 align="center">ClassPet</h1>

<p align="center">
A gamified classroom management system built with Next.js 15 and Prisma.<br>
Adopt virtual pets, score student performance, and make teaching fun.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-orange?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/version-v1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square" alt="Next.js">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square" alt="Tailwind CSS">
</p>

---

## ✨ Overview
**ClassPet** is a gamified classroom management and incentive system for K-12 classes.
Students adopt and raise virtual pets, while teachers adjust points based on daily performance. Pets level up and change status based on scores, making classroom management engaging and effective.

## 🎯 Core Features
- 🔐 **Secure Auth System** — NextAuth login with PIN code anti-cheat lock
- 👥 **Data Isolation** — Teacher-class-student data separation for privacy
- 🃏 **Student Pet Cards** — Real-time level, HP, status badges, and responsive layout
- 🎮 **Gamified Scoring** — Particle effects, level-up animations, and detailed history logs
- 🏪 **Class Store** — Redeem rewards with growth points, complete transaction ledger
- 📊 **Group Management** — Multiple grouping plans and real-time group dashboards
- ⏳ **Pet Survival System** — Hunger decay, weekend skip, holiday freeze, revive system
- 📅 **Holiday Freeze** — Automatically pauses pet status decay during vacations

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite / PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5 Beta)
- **UI**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion + Canvas Confetti

## 🚀 Getting Started
Install dependencies:
```bash
npm install
```

Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret-key"
```

Push database schema:
```bash
npx prisma db push
```

Start dev server:
```bash
npm run dev
```

Open http://localhost:3000

## 📄 License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
Any modified version used publicly or hosted online must be open-sourced under the same license.

---

**Note**: This project only supports **Chinese language** at the moment.

**Developed by**: aiwandiannaodelele (龚奕帆) / Gong Yifan
