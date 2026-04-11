'use client';

import { useState, useEffect } from 'react';
import { ClassCard } from '@/components/class/ClassCard';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { PinVerifyDialog } from '@/components/auth/PinVerifyDialog';
import type { Class } from '@prisma/client';
import { Loader2, Plus } from 'lucide-react';

interface ClassWithStudentCount extends Class {
  _count?: {
    students: number;
  };
}

export default function HomePage() {
  const [classes, setClasses] = useState<ClassWithStudentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [showPinVerify, setShowPinVerify] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<{lockSettings: boolean, hasPinCode: boolean} | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes', { cache: 'no-store' });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchClasses globally so Header can trigger it after creation
  useEffect(() => {
    (window as any).refreshHomePageClasses = fetchClasses;
    return () => {
      delete (window as any).refreshHomePageClasses;
    };
  }, []);

  useEffect(() => {
    fetchClasses();
    
    // Fetch user settings to check if lock is enabled
    fetch('/api/auth/settings')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUserSettings(data);
        }
        setIsLoadingSettings(false);
      })
      .catch(() => setIsLoadingSettings(false));
  }, []);

  const handleSettingsClick = (classId: string) => {
    if (isLoadingSettings) return;
    
    if (userSettings?.lockSettings) {
      setPendingClassId(classId);
      setShowPinVerify(true);
    } else {
      setSelectedClassId(classId);
      setSettingsOpen(true);
    }
  };

  const handlePinSuccess = () => {
    if (pendingClassId) {
      setSelectedClassId(pendingClassId);
      setSettingsOpen(true);
      setPendingClassId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">加载班级数据失败，请刷新重试。</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="mx-auto mt-24 max-w-md border-slate-200/60 shadow-md rounded-xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 shadow-inner border border-amber-200/50 overflow-hidden">
              <img src="/logo.png" alt="ClassPet Logo" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">欢迎来到萌宠班级屋</h3>
            <p className="text-slate-500 mb-2">
              当前还没有创建任何班级。
            </p>
            <p className="text-sm font-medium text-amber-600 bg-amber-50 inline-flex items-center gap-1 px-4 py-1.5 rounded-full">
              点击底部导航栏中心的 <Plus className="w-4 h-4" /> 按钮开始创建！
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="w-full px-2 md:px-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classes.map((classItem) => (
          <ClassCard 
            key={classItem.id} 
            classItem={classItem} 
            onSettingsClick={handleSettingsClick}
            onDelete={fetchClasses}
          />
        ))}
      </div>

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        classId={selectedClassId} 
      />

      <PinVerifyDialog
        open={showPinVerify}
        onOpenChange={setShowPinVerify}
        onSuccess={handlePinSuccess}
      />
    </>
  );
}
