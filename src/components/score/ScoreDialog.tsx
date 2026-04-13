"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Loader2, Heart, Trophy, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { triggerScoreUpEffect, triggerScoreDownEffect, triggerLevelUpEffect } from "@/lib/effects";
import { playScoreUp, playScoreDown, playLevelUp, playError } from "@/lib/audio";

interface Rule {
  id: string;
  name: string;
  category: string;
  score: number;
  icon?: string | null;
}

interface StudentPet {
  name: string;
  image: string;
  level: number;
  health: number;
  isDead: boolean;
  reviveCount: number;
}

interface StudentInfo {
  id: string;
  name: string;
  score: number;
  totalScore: number;
  coins: number;
  pet: StudentPet | null;
}

interface ScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string;
  studentName?: string;
  studentIds?: string[];
  studentNames?: string[];
  classId: string;
  onScoreComplete: (updatedStudent: any, scoreValue?: number, isLevelUp?: boolean) => void;
}

const CATEGORY_MAPPING: Record<string, string> = {
  basic_learning: "基础学习",
  learning_progress: "学习进步",
  discipline: "纪律习惯",
  labor_collective: "劳动集体",
  good_deeds: "好人好事",
  study_violation: "学习违纪",
  discipline_violation: "纪律违纪",
  collective_morality: "集体公德",
};

export function ScoreDialog({ open, onOpenChange, studentId, studentName, studentIds, studentNames, classId, onScoreComplete }: ScoreDialogProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>("feed");

  const targetIds = studentIds || (studentId ? [studentId] : []);
  const targetNames = studentNames || (studentName ? [studentName] : []);
  const isBatchMode = targetIds.length > 1;
  const displayName = isBatchMode ? `${targetIds.length} 名学生` : (targetNames[0] || "");

  useEffect(() => {
    if (open) {
      fetchRules();
      fetchCategories();
      if (!isBatchMode && studentId) {
        fetchStudentInfo();
      }
    }
  }, [open, classId, studentId]);

  const fetchStudentInfo = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudentInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch student info:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ruleCategories) {
          setCustomCategories(JSON.parse(data.ruleCategories));
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch(`/api/rules?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  const handleScore = async (rule: Rule) => {
    setLoading(true);
    try {
      let successCount = 0;
      let lastData = null;

      for (const id of targetIds) {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: id,
            ruleId: rule.id,
            scoreChange: rule.score,
            teacherId: "teacher-1",
          }),
        });

        const data = await response.json();

        if (response.ok) {
          successCount++;
          lastData = data;
        } else if (!isBatchMode) {
          toast.error(data.error || "评分失败");
          playError();
          setLoading(false);
          return;
        }
      }

      if (successCount === 0) {
        toast.error("批量评分失败");
        playError();
        setLoading(false);
        return;
      }

      if (rule.score > 0) {
        if (!isBatchMode && lastData?.levelUp) {
          triggerLevelUpEffect();
          toast.success(`给${displayName}喂食成功！宠物升级到了 Lv.${lastData.newLevel}！`, { duration: 5000 });
        } else {
          triggerScoreUpEffect();
          if (isBatchMode) playScoreUp();
          toast.success(`成功为 ${successCount} 名学生加了${Math.abs(rule.score)}分 - ${rule.name}`);
        }
      } else {
        triggerScoreDownEffect();
        if (!isBatchMode && lastData?.petDied) {
          toast.error(`${displayName}的宠物不幸阵亡了...`, { duration: 5000 });
        } else {
          if (isBatchMode) playScoreDown();
          toast.success(`成功为 ${successCount} 名学生扣除了${Math.abs(rule.score)}分 - ${rule.name}`);
        }
      }

      onScoreComplete(lastData?.student, rule.score, lastData?.levelUp);
      
      if (lastData?.record?.id) {
        window.dispatchEvent(new CustomEvent('score-recorded', {
          detail: {
            id: lastData.record.id,
            description: `为 ${displayName} ${rule.score > 0 ? '加' : '扣'}${Math.abs(rule.score)}分`
          }
        }));
      }
      
      if (!isBatchMode && studentId) {
        fetchStudentInfo();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add score:", error);
      toast.error(error.message || "评分失败");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(rules.map((r) => r.category)))];
  
  const positiveRules = rules.filter(r => r.score > 0);
  const negativeRules = rules.filter(r => r.score < 0);

  const filteredPositiveRules = selectedCategory === "all" 
    ? positiveRules 
    : positiveRules.filter((r) => {
        const displayCategory = CATEGORY_MAPPING[r.category] || r.category;
        return displayCategory === selectedCategory;
      });

  const filteredNegativeRules = selectedCategory === "all"
    ? negativeRules
    : negativeRules.filter((r) => {
        const displayCategory = CATEGORY_MAPPING[r.category] || r.category;
        return displayCategory === selectedCategory;
      });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-white max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isBatchMode ? "批量喂食 / 惩罚" : "喂食 / 惩罚"}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {isBatchMode 
              ? `选择规则为 ${displayName} 操作`
              : studentInfo ? (
                  <>
                    <p>选择规则为 {studentInfo.name} 操作</p>
                    {studentInfo.pet && (
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          {studentInfo.pet.image?.startsWith('http') || studentInfo.pet.image?.startsWith('/') ? (
                            <img src={studentInfo.pet.image} alt={studentInfo.pet.name} className="h-10 w-10 object-contain" />
                          ) : (
                            <span className="text-2xl">{studentInfo.pet.image || '🐾'}</span>
                          )}
                          <div>
                            <div className="font-semibold text-sm">{studentInfo.pet.name}</div>
                            <div className="text-xs text-muted-foreground">Lv.{studentInfo.pet.level}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            <span className={`text-sm font-bold ${studentInfo.pet.health > 20 ? 'text-green-600' : 'text-red-600'}`}>
                              {studentInfo.pet.health}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600">{studentInfo.score}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-sm font-bold text-purple-600">{studentInfo.coins}</span>
                          </div>
                        </div>
                        <div className="w-32">
                          <Progress value={studentInfo.pet.health} className="h-2" indicatorClassName={studentInfo.pet.health > 20 ? "bg-green-500" : "bg-red-500"} />
                        </div>
                      </div>
                    )}
                  </>
                )
              : null
            }
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4 flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="text-green-600 data-[state=active]:text-green-700">喂食 (加分)</TabsTrigger>
            <TabsTrigger value="penalty" className="text-orange-600 data-[state=active]:text-orange-700">惩罚 (扣分)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                全部
              </Button>
              {Array.from(new Set(positiveRules.map(r => CATEGORY_MAPPING[r.category] || r.category))).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredPositiveRules.length > 0 ? filteredPositiveRules.map((rule) => (
                  <Button
                    key={rule.id}
                    variant="outline"
                    className="h-auto flex-col items-center justify-center p-4 gap-2 border-2 hover:border-green-400 hover:bg-green-50 transition-all whitespace-normal text-center relative group"
                    onClick={() => handleScore(rule)}
                    disabled={loading}
                  >
                    <div className="text-3xl mb-1">
                      {rule.icon || "⭐"}
                    </div>
                    <div className="font-medium text-sm leading-tight line-clamp-2 w-full">
                      {rule.name}
                    </div>
                    <div className="absolute top-2 right-2 text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full opacity-80 group-hover:opacity-100">
                      +{rule.score}
                    </div>
                  </Button>
                )) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">暂无加分规则，请在班级设置中添加</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="penalty" className="mt-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                全部
              </Button>
              {Array.from(new Set(negativeRules.map(r => CATEGORY_MAPPING[r.category] || r.category))).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredNegativeRules.length > 0 ? filteredNegativeRules.map((rule) => (
                  <Button
                    key={rule.id}
                    variant="outline"
                    className="h-auto flex-col items-center justify-center p-4 gap-2 border-2 hover:border-orange-400 hover:bg-orange-50 transition-all whitespace-normal text-center relative group"
                    onClick={() => handleScore(rule)}
                    disabled={loading}
                  >
                    <div className="text-3xl mb-1">
                      {rule.icon || "⚠️"}
                    </div>
                    <div className="font-medium text-sm leading-tight line-clamp-2 w-full">
                      {rule.name}
                    </div>
                    <div className="absolute top-2 right-2 text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full opacity-80 group-hover:opacity-100">
                      {rule.score}
                    </div>
                  </Button>
                )) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">暂无扣分规则，请在班级设置中添加</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
