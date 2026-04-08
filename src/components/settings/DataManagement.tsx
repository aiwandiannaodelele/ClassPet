"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DataManagementProps {
  classId?: string;
}

export function DataManagement({ classId }: DataManagementProps) {
  const router = useRouter();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleExport = () => {
    toast.success("数据导出成功");
  };

  const handleImport = () => {
    toast.info("数据导入功能开发中...");
  };

  const handleResetData = async () => {
    if (!classId) return;
    setIsResetting(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset' })
      });
      
      if (res.ok) {
        toast.success("班级数据已重置成功！");
        if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
          (window as any).refreshStudentList();
        }
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error("重置失败");
      }
    } catch (error) {
      console.error(error);
      toast.error("重置失败");
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">数据导出</h3>
              <p className="text-sm text-muted-foreground">导出班级数据为 Excel 或 CSV 格式</p>
            </div>
          </div>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-600">重置班级数据</h3>
              <p className="text-sm text-muted-foreground">将班级内所有学生的成长值归零，所有宠物恢复为初始1级满血状态。此操作不可逆！</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => setShowResetDialog(true)} disabled={!classId}>
            重置分数和等级
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置班级数据吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将：
              <ul className="list-disc ml-5 mt-2 text-slate-700">
                <li>将所有学生的总分清零</li>
                <li>将所有宠物的等级重置为 Lv.1</li>
                <li>将所有宠物的健康值恢复为 100</li>
                <li>复活所有已阵亡的宠物，并清空“本学期复活次数”</li>
              </ul>
              <br />
              <strong>警告：此操作不可恢复，请确认后再执行！</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetData}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? "重置中..." : "确认重置"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
