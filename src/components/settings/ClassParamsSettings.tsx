"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, CheckCircle2, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

interface ClassParamsSettingsProps {
  classId: string;
  showOnly?: 'basic' | 'survival';
}

export function ClassParamsSettings({ classId, showOnly }: ClassParamsSettingsProps) {
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRestoringHealth, setIsRestoringHealth] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState({
    name: "",
    description: "",
    logo: "",
    dailyScoreLimit: 20,
    reviveCost: 10,
    reviveBaseHealth: 30,
    levelThresholds: "5,10,15,20,30,40,50,60,75,90",
    ruleCategories: "[\"基础学习\",\"学习进步\",\"纪律习惯\",\"劳动集体\",\"好人好事\",\"学习违纪\",\"纪律违纪\",\"集体公德\"]",
    decayGraceDays: 2,
    decayHealthPerDay: 50,
    reviveCooldownHours: 24,
    maxRevivesPerSemester: 3,
    isFrozen: false,
    petResetCost: 20
  });

  useEffect(() => {
    const fetchClassInfo = async () => {
      if (!classId) return;
      try {
        const res = await fetch(`/api/classes/${classId}`);
        if (res.ok) {
          const data = await res.json();
          setSettings({
            name: data.name || "",
            description: data.description || "",
            logo: data.logo || "",
            dailyScoreLimit: data.dailyScoreLimit || 20,
            reviveCost: data.reviveCost || 10,
            reviveBaseHealth: data.reviveBaseHealth || 30,
            levelThresholds: data.levelThresholds || "5,10,15,20,30,40,50,60,75,90",
            ruleCategories: data.ruleCategories || "[\"基础学习\",\"学习进步\",\"纪律习惯\",\"劳动集体\",\"好人好事\",\"学习违纪\",\"纪律违纪\",\"集体公德\"]",
            decayGraceDays: data.decayGraceDays ?? 2,
            decayHealthPerDay: data.decayHealthPerDay ?? 50,
            reviveCooldownHours: data.reviveCooldownHours ?? 24,
            maxRevivesPerSemester: data.maxRevivesPerSemester ?? 3,
            isFrozen: data.isFrozen ?? false,
            petResetCost: data.petResetCost ?? 20
          });
          // Small delay to prevent initial load from triggering auto-save
          setTimeout(() => setIsInitialLoad(false), 500);
        }
      } catch (error) {
        console.error('Failed to fetch class info:', error);
      }
    };
    fetchClassInfo();
  }, [classId]);

  const handleSaveSettings = async (currentSettings: typeof settings) => {
    setSavingStatus('saving');
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'settings',
          data: {
            name: currentSettings.name,
            description: currentSettings.description,
            logo: currentSettings.logo,
            dailyScoreLimit: Number(currentSettings.dailyScoreLimit),
            reviveCost: Number(currentSettings.reviveCost),
            reviveBaseHealth: Number(currentSettings.reviveBaseHealth),
            levelThresholds: currentSettings.levelThresholds,
            ruleCategories: currentSettings.ruleCategories,
            decayGraceDays: Number(currentSettings.decayGraceDays),
            decayHealthPerDay: Number(currentSettings.decayHealthPerDay),
            reviveCooldownHours: Number(currentSettings.reviveCooldownHours),
            maxRevivesPerSemester: Number(currentSettings.maxRevivesPerSemester),
            isFrozen: Boolean(currentSettings.isFrozen),
            petResetCost: Number(currentSettings.petResetCost)
          }
        }),
      });

      if (res.ok) {
        setSavingStatus('saved');
        // Reset to idle after showing success checkmark briefly
        setTimeout(() => setSavingStatus('idle'), 2000);
        
        // Use a custom event to notify Header/Layout to refresh class data
        window.dispatchEvent(new Event('class-updated'));
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error("自动保存失败，请检查网络");
      setSavingStatus('idle');
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (isInitialLoad) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSavingStatus('saving');
    debounceTimerRef.current = setTimeout(() => {
      handleSaveSettings(settings);
    }, 1000); // 1 second debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [settings, isInitialLoad]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRestoreHealth = async () => {
    setIsRestoringHealth(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'restoreHealth' }),
      });

      if (res.ok) {
        toast.success("已恢复全班宠物健康值至100%");
        window.dispatchEvent(new Event('class-updated'));
      } else {
        throw new Error("恢复失败");
      }
    } catch (error) {
      console.error('Failed to restore health:', error);
      toast.error("恢复健康值失败");
    } finally {
      setIsRestoringHealth(false);
    }
  };

  return (
    <div className="space-y-6 py-4 px-2 relative">
      {/* Top right auto-save status indicator */}
      <div className="absolute top-0 right-4 flex items-center gap-2 text-sm">
        {savingStatus === 'saving' && (
          <span className="text-amber-600 flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin" /> 保存中...
          </span>
        )}
        {savingStatus === 'saved' && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 已自动保存
          </span>
        )}
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto mt-4">
        {/* 班级基础信息 */}
        {(!showOnly || showOnly === 'basic') && (
          <Card>
            <CardHeader>
              <CardTitle>班级基础信息</CardTitle>
              <CardDescription>设置班级的名称、口号和专属图标</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="className" className="font-bold text-base">班级名称</Label>
              <Input 
                id="className" 
                type="text" 
                value={settings.name}
                onChange={(e) => handleSettingChange('name', e.target.value)}
                placeholder="例如：三年级二班"
              />
            </div>

            <div className="grid gap-2 pt-2">
              <Label htmlFor="classDescription" className="font-bold text-base">班级口号 / 描述</Label>
              <Input 
                id="classDescription" 
                type="text" 
                value={settings.description}
                onChange={(e) => handleSettingChange('description', e.target.value)}
                placeholder="例如：快乐学习，健康成长"
              />
            </div>

            <div className="grid gap-2 pt-2">
              <Label htmlFor="classLogo" className="font-bold text-base">班徽图标</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl border flex items-center justify-center bg-slate-50 overflow-hidden text-2xl relative group">
                  {settings.logo ? (
                    settings.logo.startsWith('http') || settings.logo.startsWith('/') || settings.logo.startsWith('data:') ? (
                      <img src={settings.logo} alt="logo" className="h-full w-full object-cover" />
                    ) : (
                      <span>{settings.logo}</span>
                    )
                  ) : (
                    <span className="text-slate-300">无</span>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <ImagePlus className="h-6 w-6 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleSettingChange('logo', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                  <Input 
                    id="classLogo" 
                    type="text" 
                    value={settings.logo}
                    onChange={(e) => handleSettingChange('logo', e.target.value)}
                    placeholder="输入 Emoji (如 🌟) 或上传图片"
                  />
                  <p className="text-xs text-muted-foreground">您可以直接点击左侧方块上传本地图片作为班徽，或者在此处输入一个可爱的 Emoji。</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        {(!showOnly || showOnly === 'basic') && (
          <Card>
            <CardHeader>
              <CardTitle>宠物养成规则</CardTitle>
              <CardDescription>调整积分上限和复活消耗，定制您的班级管理节奏</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="dailyScoreLimit" className="font-bold text-base">每日加分上限</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="dailyScoreLimit" 
                  type="number" 
                  className="w-32" 
                  value={settings.dailyScoreLimit}
                  onChange={(e) => handleSettingChange('dailyScoreLimit', Number(e.target.value))}
                />
                <span className="text-sm text-slate-500">分 / 天 (默认: 20)</span>
              </div>
              <p className="text-xs text-muted-foreground">限制每个学生每天通过喂食能获得的最高成长值，防止刷分。</p>
            </div>

            <div className="grid gap-2 pt-4 border-t">
              <Label htmlFor="reviveCost" className="font-bold text-base">基础复活消耗</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="reviveCost" 
                  type="number" 
                  className="w-32"
                  value={settings.reviveCost}
                  onChange={(e) => handleSettingChange('reviveCost', Number(e.target.value))}
                />
                <span className="text-sm text-slate-500">点成长值 (默认: 10)</span>
              </div>
              <p className="text-xs text-muted-foreground">宠物阵亡后，强制扣除的成长值代价。</p>
            </div>

            <div className="grid gap-2 pt-4 border-t">
              <Label htmlFor="reviveBaseHealth" className="font-bold text-base">复活后基础健康值</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="reviveBaseHealth" 
                  type="number" 
                  className="w-32"
                  value={settings.reviveBaseHealth}
                  onChange={(e) => handleSettingChange('reviveBaseHealth', Number(e.target.value))}
                />
                <span className="text-sm text-slate-500">点 (默认: 30)</span>
              </div>
              <p className="text-xs text-muted-foreground">宠物复活时初始恢复的健康值，剩余部分可由学生花费额外成长值购买（1点换2点健康）。</p>
            </div>
          </CardContent>
        </Card>
        )}

        {/* 宠物生存与惩罚规则 */}
        {(!showOnly || showOnly === 'survival') && (
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-red-700">生存与惩罚规则</CardTitle>
              <CardDescription>配置宠物饥饿衰减与多次复活的限制规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-2">
                <Label htmlFor="decayGraceDays" className="font-bold text-base">饥饿衰减宽限期</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="decayGraceDays" 
                    type="number" 
                    className="w-32"
                    value={settings.decayGraceDays}
                    onChange={(e) => handleSettingChange('decayGraceDays', Number(e.target.value))}
                  />
                  <span className="text-sm text-slate-500">天 (默认: 2)</span>
                </div>
                <p className="text-xs text-muted-foreground">连续多少天没有获得加分，宠物会开始扣除健康值。</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="decayHealthPerDay" className="font-bold text-base">每日衰减健康值</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="decayHealthPerDay" 
                    type="number" 
                    className="w-32"
                    value={settings.decayHealthPerDay}
                    onChange={(e) => handleSettingChange('decayHealthPerDay', Number(e.target.value))}
                  />
                  <span className="text-sm text-slate-500">点/天 (默认: 50)</span>
                </div>
                <p className="text-xs text-muted-foreground">进入衰减期后，每天自动扣除的健康值（基础健康值为100点）。</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="reviveCooldownHours" className="font-bold text-base">复活冷却时间</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="reviveCooldownHours" 
                    type="number" 
                    className="w-32"
                    value={settings.reviveCooldownHours}
                    onChange={(e) => handleSettingChange('reviveCooldownHours', Number(e.target.value))}
                  />
                  <span className="text-sm text-slate-500">小时 (默认: 24)</span>
                </div>
                <p className="text-xs text-muted-foreground">每次复活后，必须等待多久才能再次使用复活功能。</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="maxRevivesPerSemester" className="font-bold text-base">每学期最大复活次数</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="maxRevivesPerSemester" 
                    type="number" 
                    className="w-32"
                    value={settings.maxRevivesPerSemester}
                    onChange={(e) => handleSettingChange('maxRevivesPerSemester', Number(e.target.value))}
                  />
                  <span className="text-sm text-slate-500">次 (默认: 3)</span>
                </div>
                <p className="text-xs text-muted-foreground">超过此次数后，宠物将永久死亡，只能强制重新领养（等级归零）。</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="petResetCost" className="font-bold text-base">重置宠物消耗</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="petResetCost" 
                    type="number" 
                    className="w-32"
                    value={settings.petResetCost}
                    onChange={(e) => handleSettingChange('petResetCost', Number(e.target.value))}
                  />
                  <span className="text-sm text-slate-500">点成长值 (默认: 20)</span>
                </div>
                <p className="text-xs text-muted-foreground">学生重置宠物时需要消耗的成长值数量。</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="isFrozen" className="font-bold text-base text-blue-600">冻结所有宠物 (假期模式)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isFrozen"
                      checked={settings.isFrozen || false}
                      onCheckedChange={(checked) => handleSettingChange('isFrozen', checked)}
                    />
                    <label htmlFor="isFrozen" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      开启宠物冻结
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  开启后，即使长时间不加分，所有宠物都不会扣除健康值，也不会被饿死。周末(周六日)系统已默认不计算饥饿衰减。
                </p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label className="font-bold text-base text-green-600">一键恢复全班健康值</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  将全班所有宠物的健康值恢复至100%，同时复活已阵亡的宠物。
                </p>
                <Button
                  variant="outline"
                  className="w-fit border-green-200 text-green-700 hover:bg-green-50"
                  onClick={handleRestoreHealth}
                  disabled={isRestoringHealth}
                >
                  {isRestoringHealth ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  恢复全班健康值
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}