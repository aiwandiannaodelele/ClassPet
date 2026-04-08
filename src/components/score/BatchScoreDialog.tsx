"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  score: number;
}

interface BatchScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
  students?: Student[];
}

export function BatchScoreDialog({ open, onOpenChange, classId, students = [] }: BatchScoreDialogProps) {
  const router = useRouter();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [score, setScore] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleBatchScore = async () => {
    if (!ruleName.trim()) {
      toast.error("请输入评价规则名称");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("请至少选择一名学生");
      return;
    }

    if (!classId) {
      toast.error("班级 ID 不存在");
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      for (const studentId of selectedStudents) {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId,
            studentId,
            ruleName,
            score,
            category: "other",
          }),
        });

        if (response.ok) {
          successCount++;
        }
      }

      toast.success(`成功为 ${successCount} 名学生评分`);
      onOpenChange(false);
      setSelectedStudents([]);
      setRuleName("");
      setScore(1);
      if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
        (window as any).refreshStudentList();
      }
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      console.error("Failed to batch score:", error);
      toast.error("批量评价失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            批量评价
          </DialogTitle>
          <DialogDescription>
            一次性为多名学生添加相同的评价
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="grid gap-2">
            <Label>选择学生</Label>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="select-all"
                checked={selectedStudents.length === students.length && students.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-normal">
                全选/取消全选
              </Label>
            </div>
            <ScrollArea className="h-40 border rounded-md p-3">
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleToggleStudent(student.id)}
                    />
                    <Label htmlFor={student.id} className="text-sm font-normal flex-1">
                      {student.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ruleName">评价规则</Label>
            <Input
              id="ruleName"
              placeholder="如：作业完成优秀"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>分数</Label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">正数为加分，负数为减分</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleBatchScore} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            批量评价
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
