'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChoosePetDialog } from './ChoosePetDialog';
import { RevivePetDialog } from './RevivePetDialog';
import { StudentProfileDialog } from './StudentProfileDialog';
import { PinVerifyDialog } from '@/components/auth/PinVerifyDialog';
import { ParticleEffect } from '@/components/effects/ParticleEffect';
import { SelectionContext } from '@/app/(dashboard)/layout';
import { playScoreUp, playScoreDown, playLevelUp, playError } from '@/lib/audio';
import type { Pet, Student } from '@prisma/client';

interface StudentWithPet extends Student {
  pet: Pet | null;
}

interface StudentCardProps {
  student: StudentWithPet;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StudentCard({ student }: StudentCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isMultiSelectMode, selectedStudentIds, toggleStudentSelection } = useContext(SelectionContext);
  
  const isSelected = selectedStudentIds.includes(student.id);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [showReviveDialog, setShowReviveDialog] = useState(false);
  const [showPinVerify, setShowPinVerify] = useState(false);
  const [userSettings, setUserSettings] = useState<{lockScoring: boolean} | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [pendingAction, setPendingAction] = useState<'score' | 'revive' | 'pet' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'positive' | 'negative' | 'levelup'>('positive');

  const [localStudent, setLocalStudent] = useState<StudentWithPet>(student);
  
  useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  useEffect(() => {
    const handlePetResetTriggered = (e: any) => {
      if (e.detail.studentId === localStudent.id) {
        setShowPetDialog(true);
      }
    };
    window.addEventListener('pet-reset-triggered', handlePetResetTriggered);
    return () => window.removeEventListener('pet-reset-triggered', handlePetResetTriggered);
  }, [localStudent.id]);

  useEffect(() => {
    if (session?.user) {
      setIsLoadingSettings(true);
      fetch('/api/auth/settings')
        .then(res => res.json())
        .then(data => {
          setUserSettings(data);
          setIsLoadingSettings(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingSettings(false);
        });
    } else {
      setIsLoadingSettings(false);
    }
  }, [session]);

  const handleScoreComplete = (updatedStudent?: any, value?: number, isLevelUp?: boolean) => {
    if (updatedStudent) {
      setLocalStudent(updatedStudent);
      
      if (value) {
        if (isLevelUp) {
          setAnimationType('levelup');
          playLevelUp();
        } else if (value > 0) {
          setAnimationType('positive');
          playScoreUp();
        } else {
          setAnimationType('negative');
          playScoreDown();
        }
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), isLevelUp ? 2500 : 1500);
      }
    }
    router.refresh();
  };

  const handlePetSelected = (pet?: any) => {
    if (pet) {
      setLocalStudent(prev => ({ ...prev, pet }));
    }
    router.refresh();
  };
  
  const handleReviveComplete = (updatedStudent?: any) => {
    if (updatedStudent) {
      setLocalStudent(updatedStudent);
    } else {
      setLocalStudent(prev => ({ ...prev, pet: null }));
    }
    router.refresh();
  };

  const handleAction = (action: 'score' | 'revive' | 'pet') => {
    if (isLoadingSettings) return;

    if (userSettings?.lockScoring) {
      setPendingAction(action);
      setShowPinVerify(true);
      return;
    }

    executeAction(action);
  };

  const executeAction = (action: 'score' | 'revive' | 'pet') => {
    switch (action) {
      case 'score':
        setShowProfileDialog(true);
        break;
      case 'revive':
        setShowReviveDialog(true);
        break;
      case 'pet':
        setShowPetDialog(true);
        break;
    }
  };

  const handleCardClick = () => {
    if (isMultiSelectMode) {
      if (!localStudent.pet) {
        toast.error(`${localStudent.name} 未领养宠物，无法参与批量打分`);
        playError();
        return;
      }
      if (localStudent.pet.isDead) {
        toast.error(`${localStudent.name} 的宠物已阵亡，需要先复活`);
        playError();
        return;
      }
      toggleStudentSelection(localStudent.id);
      return;
    }

    if (localStudent.pet) {
      if (localStudent.pet.isDead) {
        handleAction('revive');
      } else {
        handleAction('score');
      }
    } else {
      handleAction('pet');
    }
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  };

  const studentNo = localStudent.studentNo || localStudent.id.slice(-4).toUpperCase();
  const progressValue = localStudent.score % 100;

  return (
    <>
      <motion.div variants={cardVariants}>
        <Card 
          className={`relative h-full transform overflow-hidden transition-all duration-200 hover:border-amber-400 group rounded-xl bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md cursor-pointer ${isMultiSelectMode && isSelected ? 'border-amber-500 border-[3px] ring-2 ring-amber-200 ring-offset-2' : 'border-slate-200/60 border-[1px]'} ${isMultiSelectMode && (!localStudent.pet || localStudent.pet.isDead) ? 'opacity-60 grayscale-[0.5]' : ''}`}
          onClick={handleCardClick}
        >
          
          {isMultiSelectMode && (
            <div className="absolute left-3 top-3 z-10">
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white/80'}`}>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
            </div>
          )}

          {localStudent.pet && (
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 items-end">
              {!localStudent.pet.isDead && (
                <Badge 
                  variant="outline" 
                  className="px-2 py-0.5 text-[10px] font-bold border-none bg-amber-500 text-white shadow-sm"
                >
                  Lv.{localStudent.pet.level}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`px-2 py-0.5 text-[11px] font-bold border-none bg-white shadow-sm ${localStudent.pet.isDead ? 'text-slate-400 bg-slate-100' : localStudent.pet.health > 20 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
              >
                {localStudent.pet.isDead ? '💀 阵亡' : `❤️ ${localStudent.pet.health}`}
              </Badge>
            </div>
          )}

          <CardContent 
            className="flex flex-col items-center justify-center p-5 pt-8 text-center bg-white h-full relative"
          >
            <ParticleEffect isActive={isAnimating} type={animationType} />
            
            <div className="relative mb-3 h-20 w-20 flex items-center justify-center">
              {localStudent.pet?.image?.startsWith('http') || localStudent.pet?.image?.startsWith('/') ? (
                <img 
                  src={localStudent.pet.image} 
                  alt={localStudent.pet.name} 
                  className={`h-full w-full object-contain drop-shadow-sm transition-all duration-200 group-hover:scale-110 ${localStudent.pet?.isDead ? 'grayscale opacity-70' : ''} ${isAnimating ? 'animate-bounce' : ''}`} 
                />
              ) : (
                <div className={`h-full w-full rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 ${localStudent.pet?.isDead ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
                  {localStudent.pet?.image && !localStudent.pet.image.startsWith('http') && !localStudent.pet.image.startsWith('/') 
                    ? localStudent.pet.image 
                    : localStudent.pet 
                      ? (localStudent.pet.name ? localStudent.pet.name.charAt(0) : '🐱') 
                      : '🥚'} 
                </div>
              )}
            </div>
            
            <div className="mt-2 flex w-full flex-col items-center space-y-2">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="truncate max-w-[100px]">{localStudent.name}</span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">#{studentNo}</span>
              </h3>
              
              <div className="w-full pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 px-1">
                  <span className="font-medium">成长值</span>
                  <span className="font-bold text-amber-600 text-sm">{localStudent.score}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <StudentProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        studentId={localStudent.id}
        classId={localStudent.classId}
        onScoreComplete={handleScoreComplete}
      />

      <ChoosePetDialog
        open={showPetDialog}
        onOpenChange={setShowPetDialog}
        studentId={localStudent.id}
        studentName={localStudent.name}
        onPetSelected={handlePetSelected}
      />
      
      {localStudent.pet && (
        <RevivePetDialog
          open={showReviveDialog}
          onOpenChange={setShowReviveDialog}
          studentId={localStudent.id}
          studentName={localStudent.name}
          petName={localStudent.pet.name}
          studentScore={localStudent.score}
          reviveCount={localStudent.pet.reviveCount}
          onSuccess={handleReviveComplete}
        />
      )}

      <PinVerifyDialog 
        open={showPinVerify} 
        onOpenChange={setShowPinVerify}
        onSuccess={handlePinSuccess}
        title="操作已锁定"
        description={`请输入老师的 PIN 码以对 ${localStudent.name} 进行操作`}
      />
    </>
  );
}
