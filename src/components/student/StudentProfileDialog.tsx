"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  X, Paintbrush, Star, RefreshCw, 
  Calendar, Undo, UtensilsCrossed, History, RotateCcw, AlertTriangle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { triggerScoreUpEffect, triggerScoreDownEffect, triggerLevelUpEffect } from "@/lib/effects";

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  classId: string;
  onScoreComplete?: (updatedStudent: any, scoreValue?: number, isLevelUp?: boolean) => void;
}

interface Rule {
  id: string;
  name: string;
  category: string;
  score: number;
  icon?: string | null;
}

interface StudentInfo {
  id: string;
  name: string;
  studentNo: string | null;
  score: number;
  coins: number;
  class: {
    petResetCost: number;
  } | null;
  pet: {
    id: string;
    name: string;
    image: string;
    level: number;
    health: number;
    isDead: boolean;
  } | null;
  records: {
    id: string;
    scoreChange: number;
    createdAt: string;
    rule: { id: string; name: string; category: string } | null;
  }[];
}

export function StudentProfileDialog({ 
  open, 
  onOpenChange, 
  studentId, 
  classId,
  onScoreComplete 
}: StudentProfileDialogProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      fetchStudent();
      fetchRules();
    }
  }, [open, studentId]);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (error) {
      console.error("Failed to fetch student:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`/api/rules?classId=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  const handleScore = async (rule: Rule) => {
    setLoading(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          ruleId: rule.id,
          scoreChange: rule.score,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (rule.score > 0) {
          if (data.levelUp) {
            triggerLevelUpEffect();
            toast.success(`升级啦！宠物到达了 Lv.${data.newLevel}`);
          } else {
            triggerScoreUpEffect();
            toast.success(`加分成功！`);
          }
        } else {
          triggerScoreDownEffect();
          toast.success(`已记录惩罚`);
        }
        
        fetchStudent();
        onScoreComplete?.(data.student, rule.score, data.levelUp);
        
        // 发送事件让 Header 显示“撤销”按钮
        if (data.record?.id) {
          window.dispatchEvent(new CustomEvent('score-recorded', {
            detail: {
              id: data.record.id,
              description: `为 ${student?.name} ${rule.score > 0 ? '加' : '扣'}${Math.abs(rule.score)}分`
            }
          }));
        }

        // 关闭窗口
        onOpenChange(false);
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (recordId: string) => {
    try {
      const res = await fetch(`/api/scores/${recordId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("已撤回记录");
        fetchStudent();
      } else {
        toast.error("撤回失败");
      }
    } catch (error) {
      toast.error("撤回失败");
    }
  };

  const handleResetPet = async () => {
    const resetCost = student?.class?.petResetCost ?? 20;
    if ((student?.score || 0) < resetCost) {
      toast.error("成长值不足");
      return;
    }

    if (!confirm(`确定要重新选择宠物领养吗？将消耗 ${resetCost} 点成长值，且当前宠物等级归零。`)) return;

    setIsResetting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/pet/reset`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success("宠物已重置，请重新领养");
        // We need to notify parent to show ChoosePetDialog
        onOpenChange(false);
        // Dispatch a custom event that StudentCard can listen to
        window.dispatchEvent(new CustomEvent('pet-reset-triggered', { detail: { studentId } }));
      } else {
        const data = await res.json();
        toast.error(data.error || "重置失败");
      }
    } catch (error) {
      toast.error("请求失败");
    } finally {
      setIsResetting(false);
    }
  };

  if (!student) return null;

  const positiveRules = rules.filter(r => r.score > 0);
  const negativeRules = rules.filter(r => r.score < 0);

  const filteredPositiveRules = selectedCategory === "all" 
    ? positiveRules 
    : positiveRules.filter(r => r.category === selectedCategory);

  const filteredNegativeRules = selectedCategory === "all"
    ? negativeRules
    : negativeRules.filter(r => r.category === selectedCategory);

  const categories = ["all", ...Array.from(new Set(rules.map(r => r.category)))];

  const expProgress = student.score % 20;
  const expNeeded = 20 - expProgress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden bg-white shadow-2xl flex flex-col">
        <DialogHeader className="sr-only shrink-0">
          <DialogTitle>学生档案 - {student.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 min-h-0 w-full">
          {/* 左侧边栏 */}
          <div className="w-[320px] flex-shrink-0 border-r bg-slate-50/30 flex flex-col">
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">学生档案·{student.name}</h2>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Student Profile</p>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-6">
                <div className="aspect-square flex items-center justify-center relative">
                  {student.pet?.image?.startsWith('http') || student.pet?.image?.startsWith('/') ? (
                    <img src={student.pet.image} alt={student.pet.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-7xl">{student.pet?.image || '🐾'}</span>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{student.name}</h3>
                    <Badge className="bg-primary hover:bg-primary text-white font-bold px-3 py-1 rounded-lg border-none shadow-sm">
                      Lv.{student.pet?.level || 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">学号</div>
                      <div className="text-sm font-bold text-slate-700">{student.studentNo || student.id.slice(-4).toUpperCase()}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">当前宠物</div>
                      <div className="text-sm font-bold text-primary">{student.pet?.name || '无'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">成长经验值</span>
                    <span className="text-xs font-black text-primary">{expProgress} / 20</span>
                  </div>
                  <Progress value={(expProgress / 20) * 100} className="h-2" />
                  <div className="text-[11px] text-muted-foreground">
                    升级还需 <span className="text-slate-900 font-bold">{expNeeded}</span> 经验
                  </div>
                </div>

                {/* 重置宠物入口 */}
                <Card className="border-red-100 bg-red-50/30">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-xs font-bold">重新领养宠物</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      重新选择宠物将保留当前成长值，但宠物等级将归零。
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full h-8 text-[11px] font-bold rounded-lg"
                      onClick={handleResetPet}
                      disabled={isResetting || (student?.score || 0) < (student?.class?.petResetCost ?? 20)}
                    >
                      {isResetting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      重新领养 (需 {student?.class?.petResetCost ?? 20} 成长值)
                    </Button>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* 右侧主内容区 */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0 border-none outline-none">
              <div className="px-8 pt-4 border-b shrink-0 bg-white">
                <TabsList className="grid w-full grid-cols-3 h-10 mb-2">
                  <TabsTrigger value="feed" className="font-bold">
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    喂食
                  </TabsTrigger>
                  <TabsTrigger value="punish" className="font-bold text-orange-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    惩罚
                  </TabsTrigger>
                  <TabsTrigger value="history" className="font-bold">
                    <History className="w-4 h-4 mr-2" />
                    历史记录
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="feed" className="flex-1 overflow-hidden m-0 flex flex-col bg-slate-50/30 min-h-0">
                <div className="px-8 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                  <Button 
                    variant={selectedCategory === "all" ? "default" : "outline"} 
                    size="sm"
                    className="rounded-full px-5 font-bold"
                    onClick={() => setSelectedCategory("all")}
                  >
                    全部
                  </Button>
                  {Array.from(new Set(positiveRules.map(r => r.category))).map(cat => (
                    <Button 
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"} 
                      size="sm"
                      className="rounded-full px-5 font-bold whitespace-nowrap"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                <ScrollArea className="flex-1 min-h-0 px-8 pb-8">
                  <div className="grid grid-cols-4 gap-3">
                    {filteredPositiveRules.map(rule => (
                      <Button
                        key={rule.id}
                        variant="outline"
                        className="h-auto flex-col items-center justify-center p-4 gap-2 border-2 hover:border-green-400 hover:bg-green-50 transition-all whitespace-normal text-center relative group bg-white shadow-sm"
                        onClick={() => !loading && handleScore(rule)}
                        disabled={loading}
                      >
                        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                          {rule.icon || "⭐"}
                        </div>
                        <div className="font-medium text-sm leading-tight line-clamp-2 w-full h-10 flex items-center justify-center">
                          {rule.name}
                        </div>
                        <div className="absolute top-2 right-2 text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                          +{rule.score}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="punish" className="flex-1 overflow-hidden m-0 flex flex-col bg-slate-50/30 min-h-0">
                <div className="px-8 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                  <Button 
                    variant={selectedCategory === "all" ? "default" : "outline"} 
                    size="sm"
                    className="rounded-full px-5 font-bold"
                    onClick={() => setSelectedCategory("all")}
                  >
                    全部
                  </Button>
                  {Array.from(new Set(negativeRules.map(r => r.category))).map(cat => (
                    <Button 
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"} 
                      size="sm"
                      className="rounded-full px-5 font-bold whitespace-nowrap"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                <ScrollArea className="flex-1 min-h-0 px-8 pb-8">
                  <div className="grid grid-cols-4 gap-3">
                    {filteredNegativeRules.map(rule => (
                      <Button
                        key={rule.id}
                        variant="outline"
                        className="h-auto flex-col items-center justify-center p-4 gap-2 border-2 hover:border-orange-400 hover:bg-orange-50 transition-all whitespace-normal text-center relative group bg-white shadow-sm"
                        onClick={() => !loading && handleScore(rule)}
                        disabled={loading}
                      >
                        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                          {rule.icon || "⚠️"}
                        </div>
                        <div className="font-medium text-sm leading-tight line-clamp-2 w-full h-10 flex items-center justify-center">
                          {rule.name}
                        </div>
                        <div className="absolute top-2 right-2 text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                          {rule.score}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-hidden m-0 flex flex-col bg-slate-50/30 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="px-8 py-6 space-y-3">
                    {student.records?.map(record => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-slate-100 hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-800">
                              {record.rule?.name || '系统操作'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(record.createdAt), "MM-dd HH:mm", { locale: zhCN })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-base font-black ${record.scoreChange > 0 ? "text-green-600" : "text-red-600"}`}>
                            {record.scoreChange > 0 ? `+${record.scoreChange}` : record.scoreChange}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold" 
                            onClick={() => handleUndo(record.id)}
                          >
                            撤回
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
