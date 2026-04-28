import { prisma } from "@/lib/prisma";
import { ClassList } from "./ClassList";

export default async function AdminClassesPage() {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      teacher: {
        select: { name: true, email: true },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">班级管理</h1>
      <p className="text-muted-foreground">查看和管理系统中的所有班级。</p>
      
      <ClassList initialClasses={classes} />
    </div>
  );
}
