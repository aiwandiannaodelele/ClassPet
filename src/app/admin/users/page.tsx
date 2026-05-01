import { prisma } from "@/lib/prisma";
import { UserList } from "./UserList";

export default async function AdminUsersPage() {
  const settings = await prisma.systemSetting.findUnique({ where: { id: "global" } });
  const enablePasswordReset = !!settings?.enablePasswordReset;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { classes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">用户管理</h1>
      <p className="text-muted-foreground">管理系统中的所有教师账号和管理员。</p>
      
      <UserList initialUsers={users} enablePasswordReset={enablePasswordReset} />
    </div>
  );
}
