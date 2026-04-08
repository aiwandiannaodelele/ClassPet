# 班级宠物园 - 后端 API 实现完成

## ✅ 已完成的 API 路由

### 1. 班级管理 API
- `GET /api/classes` - 获取所有班级
- `POST /api/classes` - 创建新班级
- `GET /api/classes/[classId]` - 获取班级详情
- `PUT /api/classes/[classId]` - 更新班级信息
- `DELETE /api/classes/[classId]` - 删除班级

### 2. 学生管理 API
- `GET /api/classes/[classId]/students` - 获取学生列表
- `POST /api/classes/[classId]/students` - 添加学生

### 3. 评分系统 API
- `GET /api/scores` - 获取评分记录
- `POST /api/scores` - 添加评分（自动更新学生分数和宠物经验）

### 4. 规则管理 API
- `GET /api/rules` - 获取评分规则
- `POST /api/rules` - 创建评分规则

### 5. 宠物系统 API
- `GET /api/pets` - 获取所有宠物
- `POST /api/pets` - 选择宠物

### 6. 商品管理 API
- `GET /api/classes/[classId]/products` - 获取商品列表
- `POST /api/classes/[classId]/products` - 添加商品

### 7. 兑换系统 API
- `GET /api/exchanges` - 获取兑换记录
- `POST /api/exchanges` - 兑换商品（自动扣除积分和更新库存）

### 8. 荣誉榜 API
- `GET /api/classes/[classId]/honor-roll` - 获取荣誉榜（含排名）

### 9. 等级配置 API
- `GET /api/classes/[classId]/level-configs` - 获取等级配置
- `POST /api/classes/[classId]/level-configs` - 保存等级配置

---

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── classes/
│   │   │   ├── route.ts                    # 班级 CRUD
│   │   │   └── [classId]/
│   │   │       ├── route.ts                # 班级详情/更新/删除
│   │   │       ├── students/route.ts       # 学生管理
│   │   │       ├── products/route.ts       # 商品管理
│   │   │       ├── level-configs/route.ts  # 等级配置
│   │   │       └── honor-roll/route.ts     # 荣誉榜
│   │   ├── scores/route.ts                 # 评分系统
│   │   ├── rules/route.ts                  # 规则管理
│   │   ├── pets/route.ts                   # 宠物系统
│   │   ├── exchanges/route.ts              # 兑换系统
│   ├── class/
│   │   └── [classId]/
│   │       └── page.tsx                    # 班级详情页面
│   └── page.tsx                            # 主页
├── components/                             # React 组件
└── lib/
    └── prisma.ts                           # Prisma 客户端
```

---

## 🗄️ 数据库模型

```prisma
Class - 班级
Student - 学生
Pet - 宠物
Rule - 评分规则
Record - 评分记录
Product - 商品
Exchange - 兑换记录
Badge - 徽章
LevelConfig - 等级配置
```

---

## 🎨 前端特性

### 界面风格
- ✅ 白色背景
- ✅ 黑色边框/线条
- ✅ 实心黄色按钮 (#F59E0B)
- ✅ shadcn 自带动画

### 功能页面
- ✅ 主页 - 班级列表/空状态
- ✅ 班级详情 - 学生列表、宠物展示、快速评分
- ✅ 创建班级对话框
- ✅ 荣誉榜对话框
- ✅ 小商店对话框
- ✅ 设置对话框

---

## 🚀 使用方法

### 1. 创建班级
```typescript
POST /api/classes
{
  "name": "三年级一班",
  "teacherId": "teacher-1"
}
```

### 2. 添加学生
```typescript
POST /api/classes/[classId]/students
{
  "name": "张三"
}
```

### 3. 创建评分规则
```typescript
POST /api/rules
{
  "classId": "class-id",
  "name": "作业完成优秀",
  "category": "learning",
  "score": 1,
  "icon": "⭐"
}
```

### 4. 评分
```typescript
POST /api/scores
{
  "studentId": "student-id",
  "ruleId": "rule-id",
  "scoreChange": 1,
  "teacherId": "teacher-1"
}
```

### 5. 选择宠物
```typescript
POST /api/pets
{
  "studentId": "student-id",
  "petId": "pet-id"
}
```

### 6. 添加商品
```typescript
POST /api/classes/[classId]/products
{
  "name": "免作业卡",
  "description": "免除一次作业",
  "price": 10,
  "category": "privilege",
  "icon": "⭐",
  "stock": 10
}
```

### 7. 兑换商品
```typescript
POST /api/exchanges
{
  "productId": "product-id",
  "studentId": "student-id"
}
```

### 8. 配置等级
```typescript
POST /api/classes/[classId]/level-configs
{
  "configs": [
    {
      "level": 1,
      "experience": 0,
      "badge": null
    },
    {
      "level": 2,
      "experience": 40,
      "badge": null
    }
  ]
}
```

---

## 📊 自动功能

1. **评分时自动更新**
   - 学生积分
   - 宠物经验值

2. **兑换时自动处理**
   - 扣除学生积分
   - 减少商品库存
   - 创建兑换记录

3. **荣誉榜自动排名**
   - 按积分降序排列
   - 自动计算排名

---

## 🌐 开发服务器

**http://localhost:3000**

当前服务器正在运行，所有 API 路由已就绪！

---

## 📝 下一步

1. ✅ 后端 API 已全部实现
2. ⏳ 前端页面集成 API
3. ⏳ 添加认证系统
4. ⏳ 批量操作功能
5. ⏳ 数据导入导出
