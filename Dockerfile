# 使用轻量级的 Node.js 镜像作为基础镜像
FROM node:20-alpine AS base

# 1. 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 构建项目
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量以跳过部分检查
ENV NEXT_TELEMETRY_DISABLED 1

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 3. 运行环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建一个非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物和必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# 确保数据目录权限正确
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动脚本：自动运行数据库迁移并启动服务
CMD ["sh", "-c", "npx prisma db push && node server.js"]
