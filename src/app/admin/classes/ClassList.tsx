"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ClassList({ initialClasses }: { initialClasses: any[] }) {
  const [classes, setClasses] = useState(initialClasses);

  const handleDelete = async (classId: string) => {
    if (!confirm("确定要删除此班级吗？所有相关的学生、宠物、规则和评分记录都将被永久删除！")) return;

    try {
      const res = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete class");

      setClasses(classes.filter(c => c.id !== classId));
      toast.success("班级已删除");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>班级名称</TableHead>
            <TableHead>任课教师</TableHead>
            <TableHead>教师邮箱</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>学生数</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>{cls.teacher?.name || "未知"}</TableCell>
              <TableCell>{cls.teacher?.email || "第三方"}</TableCell>
              <TableCell>{new Date(cls.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{cls._count.students}</TableCell>
              <TableCell className="text-right">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(cls.id)}>
                  删除班级
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {classes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                暂无班级数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
