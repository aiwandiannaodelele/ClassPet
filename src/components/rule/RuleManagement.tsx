"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X, ClipboardList, Check } from "lucide-react";
import { toast } from "sonner";

interface Rule {
  id: string;
  name: string;
  category: string;
  score: number;
  limit?: number | null;
  validPeriod?: string | null;
  icon?: string;
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

interface RuleManagementProps {
  classId?: string;
}

export function RuleManagement({ classId }: RuleManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchRules();
      fetchCategories();
    }
  }, [classId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ruleCategories) {
          try {
            const parsed = JSON.parse(data.ruleCategories);
            setCustomCategories(parsed);
            if (parsed.length > 0 && !selectedCategory) {
              setSelectedCategory(parsed[0]);
            }
          } catch (e) {
            console.error("Failed to parse ruleCategories JSON:", e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rules?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
      toast.error("加载规则失败");
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async (newCats: string[]) => {
    setIsSavingCategories(true);
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          data: {
            ruleCategories: JSON.stringify(newCats),
          }
        }),
      });

      if (response.ok) {
        setCustomCategories(newCats);
        toast.success("分类已保存");
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      console.error("Failed to save categories:", error);
      toast.error("分类保存失败");
    } finally {
      setIsSavingCategories(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (customCategories.includes(newCategoryName.trim())) {
      toast.error("该分类已存在");
      return;
    }
    const updated = [...customCategories, newCategoryName.trim()];
    saveCategories(updated);
    setNewCategoryName("");
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const isUsed = rules.some(r => r.category === catToRemove || CATEGORY_MAPPING[r.category] === catToRemove);
    if (isUsed) {
      toast.error(`无法删除：仍有规则属于"${catToRemove}"分类，请先修改那些规则。`);
      return;
    }
    const updated = customCategories.filter(c => c !== catToRemove);
    saveCategories(updated);
    if (selectedCategory === catToRemove) {
      setSelectedCategory(updated.length > 0 ? updated[0] : "");
    }
  };

  const getScoreColor = (score: number) => {
    return score > 0 ? "text-green-600" : "text-red-600";
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("规则已删除");
        fetchRules();
      } else {
        toast.error("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
      toast.error("删除失败");
    } finally {
      setRuleToDelete(null);
    }
  };

  const filteredRules = rules.filter(rule => {
    if (!selectedCategory) return true;
    // Migrate display on the fly: if the rule's category is an old English key, check if it maps to the currently selected Chinese category
    const displayCategory = CATEGORY_MAPPING[rule.category] || rule.category;
    return displayCategory === selectedCategory;
  });

  const positiveRules = rules.filter(r => r.score > 0).length;
  const negativeRules = rules.filter(r => r.score < 0).length;

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      <div className="w-48 flex-shrink-0 flex flex-col">
        <Button className="w-full justify-start" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增指标
        </Button>
        <div className="space-y-1 mt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 px-2">
            <span>分类</span>
            <button 
              onClick={() => setIsEditingCategories(!isEditingCategories)}
              className="hover:text-slate-800 transition-colors"
              title="编辑分类"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          
          {isEditingCategories ? (
            <div className="p-3 bg-slate-50 rounded-md border text-sm space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="新分类" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-7 text-xs px-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button size="sm" className="h-7 px-2 text-xs" onClick={handleAddCategory} disabled={isSavingCategories}>
                  添加
                </Button>
              </div>
              <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
                {customCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-white border rounded px-2 py-1">
                    <span className="text-xs truncate">{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-500"
                      disabled={isSavingCategories}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <Button
                variant={selectedCategory === "" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory("")}
              >
                <div className={cn("w-2 h-2 rounded-full mr-2", selectedCategory === "" ? "bg-slate-800" : "bg-transparent")} />
                全部规则
              </Button>
              {customCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-2", selectedCategory === category ? "bg-slate-800" : "bg-slate-400")} />
                  {category}
                </Button>
              ))}
            </>
          )}
        </div>

        <div className="mt-6 p-4 rounded-lg border bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">规则总计</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-green-600">加分</span> {positiveRules} 条
            </p>
            <p className="text-sm">
              <span className="text-red-600">减分</span> {negativeRules} 条
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {selectedCategory || "所有"}类指标
          </h3>
          <Badge variant="secondary">共 {filteredRules.length} 条</Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">加载中...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">暂无规则</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {filteredRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{rule.name}</h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className={cn("text-lg font-bold", getScoreColor(rule.score))}>
                            {rule.score > 0 ? "+" : ""}{rule.score}
                          </p>
                          {rule.limit && (
                            <span className="text-xs text-muted-foreground">
                              上限: {rule.limit}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingRule(rule);
                            setShowAddDialog(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setRuleToDelete(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {rule.validPeriod === "daily" ? "每日" :
                         rule.validPeriod === "weekly" ? "每周" :
                         rule.validPeriod === "monthly" ? "每月" : "不限周期"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">全部班级</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <AddRuleDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setEditingRule(null);
        }}
        classId={classId}
        onSuccess={fetchRules}
        initialData={editingRule}
        customCategories={customCategories}
      />

      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这条规则吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销。已使用该规则产生的评价记录不会被删除，但将不再显示具体的规则名称。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => ruleToDelete && handleDelete(ruleToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              确定删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const EMOJI_LIST = [
  "📝", "🙋", "💯", "🏆", "📈", "🪑", "🧹", "🤝", "❌", "⏰", "🤫", "🗑️", "⚠️",
  "⭐", "🌟", "📚", "🎨", "🎵", "⚽", "🏃", "💡", "🧠", "👏", "👍", "👑", "🎯",
  "🍎", "🏅", "🥇", "🥈", "🥉", "📌", "✅", "✨", "🔥", "💪", "🙌", "🎓", "📖",
  "🚫", "⛔", "💢", "❗", "❓", "👎", "🥱", "😴", "📱", "🎮", "🕹️", "🗣️", "😠"
];

interface AddRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
  onSuccess?: () => void;
  initialData?: Rule | null;
  customCategories: string[];
}

function AddRuleDialog({ open, onOpenChange, classId, onSuccess, initialData, customCategories }: AddRuleDialogProps) {
  const [ruleName, setRuleName] = useState("");
  const [score, setScore] = useState(1);
  const [limit, setLimit] = useState<number | "">("");
  const [validPeriod, setValidPeriod] = useState("daily");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setRuleName(initialData.name);
        setScore(initialData.score);
        setLimit(initialData.limit ?? "");
        setValidPeriod(initialData.validPeriod || "daily");
        setSelectedCategory(CATEGORY_MAPPING[initialData.category] || initialData.category);
        setIcon(initialData.icon || "⭐");
      } else {
        setRuleName("");
        setScore(1);
        setLimit("");
        setValidPeriod("daily");
        setSelectedCategory(customCategories.length > 0 ? customCategories[0] : "");
        setIcon("⭐");
      }
    }
  }, [open, initialData, customCategories]);

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast.error("请输入规则名称");
      return;
    }

    if (!classId) {
      toast.error("班级 ID 不存在");
      return;
    }
    
    if (!selectedCategory) {
      toast.error("请选择或添加一个分类");
      return;
    }

    setLoading(true);
    try {
      const url = initialData ? `/api/rules/${initialData.id}` : "/api/rules";
      const method = initialData ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          name: ruleName,
          category: selectedCategory,
          score,
          limit: limit === "" ? null : Number(limit),
          validPeriod,
          icon,
        }),
      });

      if (response.ok) {
        toast.success(initialData ? "规则修改成功！" : "规则添加成功！");
        onOpenChange(false);
        setRuleName("");
        setScore(1);
        setLimit("");
        setValidPeriod("daily");
        setSelectedCategory("basic_learning");
        setIcon("⭐");
        onSuccess?.();
      } else {
        toast.error("添加规则失败");
      }
    } catch (error) {
      console.error("Failed to add rule:", error);
      toast.error("添加规则失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{initialData ? "编辑规则" : "添加规则"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 relative">
              <Label>图标</Label>
              <Button 
                variant="outline" 
                className="w-12 h-10 text-xl px-0" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {icon}
              </Button>
              {showEmojiPicker && (
                <div className="absolute top-16 left-0 z-50 bg-white border shadow-lg rounded-md p-2 w-64">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-medium text-slate-500">选择图标</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setShowEmojiPicker(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        className={cn(
                          "w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-lg transition-colors",
                          icon === emoji && "bg-slate-200 ring-1 ring-slate-300"
                        )}
                        onClick={() => {
                          setIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="ruleName">规则名称</Label>
              <Input
                id="ruleName"
                placeholder="如：作业完成优秀"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>分类</Label>
            <div className="flex gap-2 flex-wrap">
              {customCategories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>分数</Label>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                正数为加分(喂食)，负数为扣分(惩罚)
              </p>
            </div>
            <div className="grid gap-2">
              <Label>分数上限 (可选)</Label>
              <Input
                type="number"
                placeholder="无上限"
                value={limit}
                onChange={(e) => setLimit(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>生效周期</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={validPeriod === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setValidPeriod("daily")}
              >
                每日
              </Button>
              <Button
                type="button"
                variant={validPeriod === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setValidPeriod("weekly")}
              >
                每周
              </Button>
              <Button
                type="button"
                variant={validPeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setValidPeriod("monthly")}
              >
                每月
              </Button>
              <Button
                type="button"
                variant={validPeriod === "none" ? "default" : "outline"}
                size="sm"
                onClick={() => setValidPeriod("none")}
              >
                不限
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
