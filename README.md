<p align="center">
  <img src="https://raw.githubusercontent.com/aiwandiannaodelele/ClassPet/refs/heads/main/public/logo.png" alt="ClassPet Logo" width="128">
</p>

<h1 align="center">ClassPet</h1>

<p align="center">
A gamified classroom management system built with Next.js 16 and Prisma.<br>
Adopt virtual pets, score student performance, and make teaching fun.
</p>

<p align="center">
  <a href="https://github.com/aiwandiannaodelele/ClassPicker/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/aiwandiannaodelele/ClassPicker" alt="License">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" alt="Next.js">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React">
  </a>
  <a href="https://ui.shadcn.com/">
    <img src="https://img.shields.io/badge/shadcn/ui-black?logo=shadcnui&logoColor=white" alt="shadcn/ui">
  </a>
  <a href="https://www.prisma.io/">
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
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
- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite / PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5 Beta)
- **UI**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion + Canvas Confetti

## 🚀 Production Deployment (PM2)

### 1. Environment Setup
Ensure your server has Node.js (v20+) and PM2 installed.

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://your-server-ip:port"
AUTH_TRUST_HOST=true
```

### 3. Installation & Build
```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Build for production
npm run build
```

### 4. Start with PM2
```bash
# Start and name the process
pm2 start npm --name "classpet" -- start

# Save for auto-restart on reboot
pm2 save
pm2 startup
```

## 📄 License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
Any modified version used publicly or hosted online must be open-sourced under the same license.

---

**Note**: This project only supports **Chinese language** at the moment.

**Developed by**: aiwandiannaodelele (龚奕帆) / Gong Yifan
