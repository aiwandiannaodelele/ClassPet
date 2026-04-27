"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RevivePetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  petName: string;
  studentScore: number;
  reviveCount?: number;
  onSuccess: (updatedStudent?: any) => void;
}

export function RevivePetDialog({ open, onOpenChange, studentId, studentName, petName, studentScore, reviveCount = 0, onSuccess }: RevivePetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [extraHealCost, setExtraHealCost] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isNegative = studentScore < 0;
  // 负分状态下只能重新领养，不能复活
  const canRevive = !isNegative && studentScore >= (10 + extraHealCost) && reviveCount < 3;

  const handleRevive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/pet/revive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extraHealCost }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "复活失败");
      
      toast.success("宠物复活成功！");
      onSuccess(data.student);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to revive pet:", error);
      toast.error(error.message || "复活失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}/pet/reset`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("重置失败");

      toast.success("旧数据已清除，请重新领养");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reset pet:", error);
      toast.error("操作失败，请重试");
    } finally {
      setLoading(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            宠物 {petName} 已消亡
          </DialogTitle>
          <DialogDescription>
            {studentName} 的守护宠物因健康值耗尽已进入休眠状态。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isNegative ? (
            // 负分状态：只能重新领养
            <Alert variant="destructive">
              <AlertTitle>成长值为负，无法复活</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                当前成长值为 <strong>{studentScore}</strong> 分（负数）。
                <br />
                <span className="text-red-600 font-bold mt-2 inline-block">
                  负分状态下无法复活宠物，只能选择重新领养。
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            // 正常状态：显示复活选项
            <>
              <Alert variant={reviveCount >= 3 ? "destructive" : "default"}>
                <AlertTitle>{reviveCount >= 3 ? "复活次数已达上限" : "基础复活"}</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {reviveCount >= 3 ? (
                    <span className="text-red-600 font-bold block">
                      本学期复活次数已达上限（3次），无法再次复活，仅可重新领养。
                    </span>
                  ) : (
                    <>
                      直接消耗 <strong>10</strong> 点成长值即可复活宠物。复活后保留原有等级，但初始健康值仅为 30 点。
                      {studentScore < 10 && (
                        <span className="text-red-600 font-bold mt-2 block">
                          您当前成长值不足 10 点，无法复活。请继续赚取积分，或选择重新领养。
                        </span>
                      )}
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {reviveCount < 3 && (
                <div className={`space-y-4 border p-4 rounded-md bg-slate-50 ${!canRevive ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid gap-2">
                    <Label className="font-medium text-primary">
                      自主回血 (可选)
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">
                      每额外消耗 1 点成长值，可恢复 2 点健康值。
                      您当前总成长值: <strong>{studentScore}</strong>
                    </p>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        min={0} 
                        max={Math.floor((100 - 30) / 2)} 
                        value={extraHealCost} 
                        onChange={(e) => setExtraHealCost(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm">点成长值</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      预计复活后健康值: <strong>{Math.min(100, 30 + extraHealCost * 2)}</strong> / 100
                    </p>
                    <p className="text-xs text-red-600">
                      总计消耗成长值: <strong>{10 + extraHealCost}</strong> 点
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-center text-slate-400">
                或者选择放弃当前宠物，重新领养（原宠物数据永久清零，等级归零）
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="destructive" 
            className="sm:mr-auto w-full sm:w-auto" 
            onClick={() => setShowResetConfirm(true)} 
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            重新领养
          </Button>
          {!isNegative && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                取消
              </Button>
              <Button 
                onClick={handleRevive} 
                disabled={loading || !canRevive || reviveCount >= 3} 
                className="flex-1 sm:flex-none"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                确认复活
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要重新领养吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久清空该学生当前宠物的等级、经验和历史记录，一切从零开始！此操作不可撤销！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
            >
              确定重新领养
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
