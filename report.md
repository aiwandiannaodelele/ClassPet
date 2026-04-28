此次合并对认证系统进行了重大升级，引入了 GitHub/Google 第三方登录和 Turnstile 人机验证，并添加了忘记密码与重置功能。同时，新增了功能完善的管理后台，并基于新的 `radix-maia` 主题全面重构了整站的 UI 组件和颜色样式。
| 文件 | 变更 |
|------|---------|
| components.json | - 更新了 UI 组件的主题配置为 `radix-maia`，更改了基础颜色并配置了图标库。 |
| package-lock.json | - 更新了依赖锁定版本。 |
| package.json | - 添加了 `@auth/core`, `@auth/prisma-adapter`, `@hugeicons/react`, `@marsidev/react-turnstile` 等依赖。<br>- 更新了 `next-auth` 及 UI 组件相关库版本。 |
| prisma/schema.prisma | - 添加了 NextAuth 所需的 Account, Session, VerificationToken 模型。<br>- 在 User 模型中增加了 role 和 image 字段，并将 email 和 password 改为可选。<br>- 新增了 SystemSetting 模型以存储全局安全设置。 |
| scripts/seedAdmin.ts | - 新增脚本，用于初始化超级管理员账号及全局系统设置。 |
| src/app/(auth)/forgot-password/page.tsx | - 新增忘记密码页面，支持发送密码重置链接。 |
| src/app/(auth)/login/page.tsx | - 增加了 GitHub 和 Google 第三方登录按钮。<br>- 集成了 Cloudflare Turnstile 进行人机验证。<br>- 增加了忘记密码链接及错误提示处理。 |
| src/app/(auth)/register/page.tsx | - 优化了页面的视觉样式，调整了图标和按钮颜色以匹配新主题。 |
| src/app/(auth)/reset-password/page.tsx | - 新增重置密码页面，允许用户通过有效令牌设置新密码。 |
| src/app/(dashboard)/page.tsx | - 优化了空状态提示的 UI 样式，调整了颜色和卡片布局。 |
| src/app/(dashboard)/student/[id]/client.tsx | - 调整了进度条和分数显示的颜色样式以匹配新主题。 |
| src/app/admin/classes/ClassList.tsx | - 新增班级列表组件，支持管理员查看和删除系统中的班级。 |
| src/app/admin/classes/page.tsx | - 新增后台班级管理页面。 |
| src/app/admin/layout.tsx | - 新增管理员后台布局，包含侧边栏导航和权限验证。 |
| src/app/admin/page.tsx | - 新增后台仪表盘页面，展示用户、班级和学生总数统计。 |
| src/app/admin/settings/SettingsForm.tsx | - 新增系统设置表单，支持配置人机验证、邮箱验证码和 OAuth 登录开关。 |
| src/app/admin/settings/page.tsx | - 新增后台系统设置页面。 |
| src/app/admin/users/UserList.tsx | - 新增用户列表组件，支持管理员修改用户角色或删除用户。 |
| src/app/admin/users/page.tsx | - 新增后台用户管理页面。 |
| src/app/api/admin/classes/[classId]/route.ts | - 新增 API 路由，处理管理员删除班级的请求。 |
| src/app/api/admin/settings/route.ts | - 新增 API 路由，处理全局系统设置的更新请求。 |
| src/app/api/admin/users/[userId]/role/route.ts | - 新增 API 路由，处理管理员修改用户角色的请求。 |
| src/app/api/admin/users/[userId]/route.ts | - 新增 API 路由，处理管理员删除用户的请求。 |
| src/app/api/auth/forgot-password/route.ts | - 新增 API 路由，处理忘记密码请求并生成验证令牌。 |
| src/app/api/auth/reset-password/route.ts | - 新增 API 路由，处理密码重置请求并更新用户密码。 |
| src/app/api/classes/[classId]/students/route.ts | - 修复了成长值衰减计算的逻辑偏差。 |
| src/app/api/groups/[groupId]/scores/route.ts | - 优化了小组评分逻辑，统一更新最后的评分时间。 |
| src/app/api/settings/global/route.ts | - 新增 API 路由，用于获取前端所需的全局公开设置。 |
| src/app/globals.css | - 引入了 shadcn 样式和新主题变量，全面重构了 CSS 自定义属性和组件样式。 |
| src/app/layout.tsx | - 引入了 Inter 字体并将其设置为默认无衬线字体。 |
| src/components/account/AccountSettingsDialog.tsx | - 优化了组件的标签页样式和按钮颜色。 |
| src/components/auth/PinVerifyDialog.tsx | - 调整了图标和按钮颜色以匹配新主题的主色调。 |
| src/components/class/ClassCard.tsx | - 调整了卡片边框、背景及悬停效果的颜色样式。 |
| src/components/effects/ParticleEffect.tsx | - 调整了粒子动画的正向和升级颜色以匹配新主题。 |
| src/components/history/HistoryDialog.tsx | - 调整了历史记录分类的颜色映射。 |
| src/components/honor/HonorRollDialog.tsx | - 优化了荣誉榜对话框的样式，使用新的主题色替换了原有的琥珀色。 |
| src/components/layout/Header.tsx | - 将头部组件的图标和按钮交互颜色更新为新主题色。<br>- 在用户下拉菜单中为管理员角色增加了进入后台的入口。 |
| src/components/pet/LevelUpAnimation.tsx | - 更新了升级动画的文本和光晕颜色样式。 |
| src/components/pet/PetSelectorDialog.tsx | - 优化了对话框容器样式，移除了不必要的高度限制。 |
| src/components/rule/RuleManagement.tsx | - 移除了分数上限功能及相关 UI。<br>- 简化了生效周期选择，去除了原有的多选按钮组。 |
| src/components/score/ScoreDialog.tsx | - 调整了分数和图标的颜色样式。 |
| src/components/settings/ClassManagement.tsx | - 调整了头像占位符的背景色。 |
| src/components/settings/ClassParamsSettings.tsx | - 更新了保存状态提示文本的颜色。 |
| src/components/settings/GrowthSettings.tsx | - 更新了保存状态提示文本的颜色。 |
| src/components/settings/SettingsDialog.tsx | - 优化了标签页布局和滚动区域，移除了固定的高度限制。 |
| src/components/store/StoreDialog.tsx | - 更新了商店商品的金币图标及价格文本颜色。 |
| src/components/student/ChoosePetDialog.tsx | - 调整了宠物选中状态的边框和背景颜色。 |
| src/components/student/RevivePetDialog.tsx | - 更新了标签文本的颜色。 |
| src/components/student/StudentCard.tsx | - 优化了学生卡片的边框、背景和进度条颜色，以适配新主题。 |
| src/components/student/StudentListContainer.tsx | - 更新了多选模式下的计数徽章和操作按钮的颜色。 |
| src/components/student/StudentProfileDialog.tsx | - 优化了标签页切换和滚动区域的布局，更新了徽章颜色。 |
| src/components/ui/alert-dialog.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/alert.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/avatar.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/badge.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/button.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/card.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/checkbox.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/dialog.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/dropdown-menu.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/input.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/label.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/progress.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/scroll-area.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/select.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/slider.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/sonner.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/switch.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/table.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/tabs.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/ui/textarea.tsx | - 使用新的 shadcn-ui 规范更新了组件实现。<br>- 集成了 hugeicons 替换了原有的 lucide-react 图标。 |
| src/components/widgets/DecibelWidget.tsx | - 调整了分贝指示器的颜色样式以适配新主题。 |
| src/components/widgets/RandomPickerWidget.tsx | - 更新了随机点名组件的头像框和按钮颜色。 |
| src/components/widgets/TimerWidget.tsx | - 优化了计时器组件的边框、背景及控制按钮颜色。 |
| src/lib/auth/authOptions.ts | - 配置 NextAuth 使用 PrismaAdapter，并集成了 GitHub 和 Google OAuth。<br>- 增加了 Turnstile 人机验证校验逻辑。<br>- 在 session 中附加了用户的 role 属性。 |
| src/proxy.ts | - 移除了未使用的 `isApiRoute` 变量。 |
