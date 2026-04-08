"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onStudentCreated: () => void;
}

export function CreateStudentDialog({ open, onOpenChange, classId, onStudentCreated }: CreateStudentDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!studentName.trim()) {
      toast.error("请输入学生姓名");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: studentName.trim(), studentNo: studentNo.trim() }),
      });

      if (!response.ok) {
        let errorMessage = "创建失败";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Response body is empty or not valid JSON
          errorMessage = `请求失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      onStudentCreated();
      setStudentName("");
      setStudentNo("");
      onOpenChange(false);
      toast.success("学生添加成功！");
    } catch (error) {
      console.error("Failed to create student:", error);
      toast.error("添加学生失败");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setStudentName("");
    setStudentNo("");
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>添加学生</DialogTitle>
          <DialogDescription>
            输入学生姓名和学号（可选），然后点击添加按钮。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">学生姓名</Label>
            <Input
              id="name"
              placeholder="请输入姓名"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentNo">学号（可选）</Label>
            <Input
              id="studentNo"
              placeholder="请输入学号"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "添加中..." : "添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
