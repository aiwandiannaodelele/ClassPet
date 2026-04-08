"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateClassDialog({ open, onOpenChange, onSuccess }: CreateClassDialogProps) {
  const [className, setClassName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!className.trim()) {
      toast.error("请输入班级名称");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: className.trim(),
          teacherId: "teacher-1",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.error || "Failed to create class");
      }

      toast.success("班级创建成功！");
      setClassName("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating class:", error);
      toast.error(error.message || "创建班级失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">创建新班级</DialogTitle>
          <DialogDescription>
            给您的班级起一个响亮的名字吧
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="className">班级名称</Label>
            <Input
              id="className"
              placeholder="例如：三年级一班"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? "创建中..." : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
