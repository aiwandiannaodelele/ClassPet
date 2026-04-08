"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { triggerScoreUpEffect, triggerScoreDownEffect, triggerLevelUpEffect } from "@/lib/effects";

interface Rule {
  id: string;
  name: string;
  category: string;
  score: number;
  icon?: string | null;
}

interface GroupScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  classId: string;
  onScoreComplete: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  basic_learning: "基础学习",
  learning_progress: "学习进步",
  discipline: "纪律习惯",
  labor_collective: "劳动集体",
  good_deeds: "好人好事",
  study_violation: "学习违纪",
  discipline_violation: "纪律违纪",
  collective_morality: "集体公德",
};

export function GroupScoreDialog({ open, onOpenChange, groupId, groupName, classId, onScoreComplete }: GroupScoreDialogProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (open) {
      fetchRules();
    }
  }, [open, classId]);

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
      const response = await fetch(`/api/groups/${groupId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: rule.id,
          scoreChange: rule.score,
          teacherId: "teacher-1", // Should come from auth session in a real app
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "评分失败");
        setLoading(false);
        return;
      }

      const action = rule.score > 0 ? "加分" : "减分";
      
      if (rule.score > 0) {
        if (data.anyLevelUp) {
          triggerLevelUpEffect();
        } else {
          triggerScoreUpEffect();
        }
      } else {
        triggerScoreDownEffect();
      }

      if (data.skippedCount > 0) {
        toast.success(`给【${groupName}】的 ${data.successCount} 名存活成员${action}${Math.abs(rule.score)}分 - ${rule.name} (已跳过 ${data.skippedCount} 名阵亡成员)`);
      } else {
        toast.success(`给【${groupName}】全组${action}${Math.abs(rule.score)}分 - ${rule.name}`);
      }
      
      onScoreComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add score:", error);
      toast.error(error.message || "评分失败");
    } finally {
      setLoading(false);
    }
  };

  // Split rules into positive (reward/feed) and negative (penalty/deduct)
  const positiveRules = rules.filter(r => r.score > 0);
  const negativeRules = rules.filter(r => r.score < 0);

  const filteredPositiveRules = selectedCategory === "all" 
    ? positiveRules 
    : positiveRules.filter((r) => r.category === selectedCategory);

  const filteredNegativeRules = selectedCategory === "all"
    ? negativeRules
    : negativeRules.filter((r) => r.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>给小组评分</DialogTitle>
          <DialogDescription>
            为 <span className="font-semibold text-primary">【{groupName}】</span> 全体存活成员进行统一评分
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="feed" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="text-green-600 data-[state=active]:text-green-700">喂食 (加分)</TabsTrigger>
            <TabsTrigger value="penalty" className="text-orange-600 data-[state=active]:text-orange-700">惩罚 (扣分)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                全部
              </Button>
              {Array.from(new Set(positiveRules.map(r => r.category))).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {CATEGORY_NAMES[category] || category}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[400px] pr-4">
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
                    {loading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                      </div>
                    )}
                  </Button>
                )) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">暂无加分规则，请在班级设置中添加</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="penalty" className="mt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                全部
              </Button>
              {Array.from(new Set(negativeRules.map(r => r.category))).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {CATEGORY_NAMES[category] || category}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[400px] pr-4">
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
                    {loading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                      </div>
                    )}
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
