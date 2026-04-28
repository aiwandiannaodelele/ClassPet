"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface GrowthSettingsProps {
  classId: string;
}

interface LevelConfig {
  level: number;
  experience: number;
  badge?: string;
}

const defaultConfigs: LevelConfig[] = [
  { level: 1, experience: 5 },
  { level: 2, experience: 10 },
  { level: 3, experience: 15 },
  { level: 4, experience: 20 },
  { level: 5, experience: 30 },
  { level: 6, experience: 40 },
  { level: 7, experience: 50 },
  { level: 8, experience: 60 },
  { level: 9, experience: 75 },
  { level: 10, experience: 90 },
];

export function GrowthSettings({ classId }: GrowthSettingsProps) {
  const [configs, setConfigs] = useState<LevelConfig[]>(defaultConfigs);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/classes/${classId}/level-configs`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Merge loaded configs with defaults in case of missing levels
            const merged = defaultConfigs.map(def => {
              const found = data.find((d: any) => d.level === def.level);
              return found ? { level: found.level, experience: found.experience, badge: found.badge || '' } : def;
            });
            setConfigs(merged);
          }
          setTimeout(() => setIsInitialLoad(false), 500);
        }
      } catch (error) {
        console.error("Error loading level configs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [classId]);

  const handleSave = async (currentConfigs: LevelConfig[]) => {
    if (!classId) return;
    setSavingStatus('saving');
    try {
      const response = await fetch(`/api/classes/${classId}/level-configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: currentConfigs }),
      });

      if (!response.ok) throw new Error("Failed to save");
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving level configs:", error);
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
      handleSave(configs);
    }, 1000); // 1 second debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [configs, isInitialLoad]);

  const updateConfig = (level: number, field: keyof LevelConfig, value: any) => {
    setConfigs(prev => prev.map(c => 
      c.level === level ? { ...c, [field]: value } : c
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  }

  if (!classId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">🏫</span>
        <h3 className="text-lg font-semibold text-slate-700">请先选择一个班级</h3>
        <p className="text-slate-500 mt-2">成长设置需要针对具体班级进行配置。请进入一个班级后再打开设置。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Top right auto-save status indicator */}
      <div className="absolute top-[-20px] right-4 flex items-center gap-2 text-sm">
        {savingStatus === 'saving' && (
          <span className="text-primary flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin" /> 保存中...
          </span>
        )}
        {savingStatus === 'saved' && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 已自动保存
          </span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">成长值等级升级门槛（阶梯版）</h3>
        <p className="text-sm text-slate-500 mb-4">设置升至对应等级所需要的<strong>累计成长值</strong>。</p>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 items-center mb-2 font-medium text-slate-700">
                <div className="col-span-1">升至等级</div>
                <div className="col-span-3">累计所需成长值</div>
              </div>
              {configs.map((config) => (
                <div key={config.level} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="col-span-1">等级 {config.level}</Label>
                  <Input 
                    type="number" 
                    className="col-span-3"
                    value={config.experience} 
                    onChange={(e) => updateConfig(config.level, "experience", parseInt(e.target.value) || 0)}
                    placeholder="累计所需成长值" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
