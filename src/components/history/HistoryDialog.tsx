"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, Undo2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Record {
  id: string;
  studentName: string;
  ruleName: string;
  score: number;
  category: string;
  createdAt: string;
}

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
}

export function HistoryDialog({ open, onOpenChange, classId }: HistoryDialogProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordToUndo, setRecordToUndo] = useState<string | null>(null);

  useEffect(() => {
    if (open && classId) {
      fetchRecords();
    }
  }, [open, classId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scores?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
      toast.error("加载评价记录失败");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      learning: "bg-blue-500",
      behavior: "bg-purple-500",
      health: "bg-green-500",
      other: "bg-primary",
    };
    return colors[category] || "bg-gray-500";
  };

  const handleUndo = async (recordId: string) => {
    try {
      const response = await fetch(`/api/scores/${recordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("记录已成功撤销");
        setRecords(prev => prev.filter(r => r.id !== recordId));
        if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
          (window as any).refreshStudentList();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "撤销失败");
      }
    } catch (error) {
      console.error("Failed to undo record:", error);
      toast.error("撤销失败");
    } finally {
      setRecordToUndo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            评价记录
          </DialogTitle>
          <DialogDescription>
            查看最近的评价记录
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-muted-foreground">暂无评价记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学生</TableHead>
                  <TableHead>规则</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="text-right">分数</TableHead>
                  <TableHead className="text-right">时间</TableHead>
                  <TableHead className="text-right w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.ruleName}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(record.category)} variant="outline">
                        {record.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${record.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {record.score > 0 ? "+" : ""}{record.score}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(record.createdAt).toLocaleString("zh-CN", {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setRecordToUndo(record.id)}
                        title="撤销此记录"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
      
      <AlertDialog open={!!recordToUndo} onOpenChange={(open) => !open && setRecordToUndo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要撤销这条评价记录吗？</AlertDialogTitle>
            <AlertDialogDescription>
              撤销后，该学生因这条记录产生的分数、经验值和健康值变化将被还原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => recordToUndo && handleUndo(recordToUndo)}
              className="bg-red-600 hover:bg-red-700"
            >
              确定撤销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
