'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Store as StoreIcon,
  History,
  Undo,
  Users,
  Settings,
  Search,
  Plus,
  Download,
  ArrowLeft,
  SortAsc,
  Hash,
  Star,
  Wrench,
  Timer,
  Dices,
  Mic,
  PieChart,
  CalendarCheck,
  CheckSquare,
  Gift,
  X,
  Minus,
  LogOut,
  UserCircle,
  Grid
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateClassDialog } from '@/components/class/CreateClassDialog';
import { HonorRollDialog } from '@/components/honor/HonorRollDialog';
import { StoreDialog } from '@/components/store/StoreDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { HistoryDialog } from '@/components/history/HistoryDialog';
import { BatchScoreDialog } from '@/components/score/BatchScoreDialog';
import { TimerWidget } from '@/components/widgets/TimerWidget';
import { RandomPickerWidget } from '@/components/widgets/RandomPickerWidget';
import { DecibelWidget } from '@/components/widgets/DecibelWidget';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import type { Class } from '@prisma/client';
import { AccountSettingsDialog } from '@/components/account/AccountSettingsDialog';
import { PinVerifyDialog } from '@/components/auth/PinVerifyDialog';
import { SelectionContext, SearchContext, CardSizeContext } from '@/app/(dashboard)/layout';

interface HeaderProps {
  classes: Class[];
  onClassCreated: () => void;
  onSortChange?: (sortType: string) => void;
  currentSort?: string;
  onViewChange?: (view: string) => void;
  currentView?: string;
}

export function Header({ classes, onClassCreated, onSortChange, currentSort = 'name', currentView = 'students', onViewChange }: HeaderProps) {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const classId = params?.id as string | undefined;
  const { isMultiSelectMode, toggleMultiSelectMode } = useContext(SelectionContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const { cardSize, setCardSize } = useContext(CardSizeContext);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showHonorRoll, setShowHonorRoll] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastAction, setLastAction] = useState<{ id: string, description: string } | null>(null);

  // Listen for score events to update the quick undo button
  useEffect(() => {
    const handleScoreEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.id) {
        setLastAction({
          id: customEvent.detail.id,
          description: customEvent.detail.description || '评分'
        });
        
        // Auto-hide undo button after 30 seconds
        setTimeout(() => {
          setLastAction(prev => prev?.id === customEvent.detail.id ? null : prev);
        }, 30000);
      }
    };
    
    window.addEventListener('score-recorded', handleScoreEvent);
    return () => window.removeEventListener('score-recorded', handleScoreEvent);
  }, []);

  const handleQuickUndo = async () => {
    if (!lastAction) return;
    
    try {
      const response = await fetch(`/api/scores/${lastAction.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(`已撤销: ${lastAction.description}`);
        setLastAction(null); // Hide button on success
        
        // Refresh data
        if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
          (window as any).refreshStudentList();
        }
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "撤销失败");
      }
    } catch (error) {
      console.error("Failed to undo score:", error);
      toast.error("撤销失败");
    }
  };
  const [showBatchScore, setShowBatchScore] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showPinVerifyForSettings, setShowPinVerifyForSettings] = useState(false);
  const [showPinVerifyForScoring, setShowPinVerifyForScoring] = useState(false);
  const [showPinVerifyForAccount, setShowPinVerifyForAccount] = useState(false);
  const [userSettings, setUserSettings] = useState<{lockSettings: boolean, lockScoring: boolean, hasPinCode: boolean, avatar?: string} | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted to prevent hydration mismatch for session data
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch lock settings on mount
  useEffect(() => {
    if (session?.user) {
      setIsLoadingSettings(true);
      fetch('/api/auth/settings')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Settings fetch failed with status: ${res.status}`);
          }
          const text = await res.text();
          if (!text) {
            return null;
          }
          return JSON.parse(text);
        })
        .then(data => {
          if (data) {
            setUserSettings(data);
          }
          setIsLoadingSettings(false);
        })
        .catch(err => {
          console.error('Failed to fetch user settings:', err);
          setIsLoadingSettings(false);
        });
    } else {
      setIsLoadingSettings(false);
    }
  }, [session, showAccountSettings]);

  const handleOpenAccountSettings = () => {
    if (isLoadingSettings) return;
    if (userSettings?.hasPinCode) {
      setShowPinVerifyForAccount(true);
    } else {
      setShowAccountSettings(true);
    }
  };

  const handleOpenSettings = () => {
    if (isLoadingSettings) return; // Prevent clicking while loading
    if (userSettings?.lockSettings) {
      setShowPinVerifyForSettings(true);
    } else {
      setShowSettings(true);
    }
  };

  const handleOpenBatchScore = () => {
    toggleMultiSelectMode();
  };

  // Widget States
  const [showTimer, setShowTimer] = useState(false);
  const [showRandomPicker, setShowRandomPicker] = useState(false);
  const [showDecibel, setShowDecibel] = useState(false);

  const handleSuccess = () => {
    setShowCreateDialog(false);
    onClassCreated(); // This updates the Layout's classes (for the dropdown/header)
    toast.success('班级创建成功！现在开始添加学生和宠物吧！');
    
    // Call the global refresh function if we are on the home page
    if (typeof window !== 'undefined' && (window as any).refreshHomePageClasses) {
      (window as any).refreshHomePageClasses();
    }
    
    // Force a soft reload to ensure the home page fetches the new class list
    router.push('/');
    router.refresh();
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case 'studentNo': return '学号排序';
      case 'score': return '分数排序';
      case 'name':
      default: return '姓名排序';
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] border-t border-amber-100 flex flex-col">
        {/* Tier 1: Sub-navigation */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-slate-50 bg-slate-50/50">
          {/* Left: Back / Class Selector */}
          <div className="flex items-center gap-2 w-1/3">
            {classId && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-full h-8 px-3 transition-colors"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">班级</span>
                </Button>
                {lastAction && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs text-slate-500 hover:text-amber-600 border-dashed rounded-full animate-in fade-in slide-in-from-left-4"
                    onClick={handleQuickUndo}
                  >
                    <Undo className="h-3.5 w-3.5 mr-1" />
                    撤销上一步
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Center: Tabs */}
          {classId && (
            <div className="flex justify-center w-1/3">
              <Tabs value={currentView} className="w-[200px]" onValueChange={(v) => onViewChange?.(v)}>
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="students" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full">学生</TabsTrigger>
                  <TabsTrigger value="groups" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full">小组</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Right: Search and Sort */}
          {classId && (
            <div className="flex items-center justify-end gap-2 w-1/3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0 rounded-full text-slate-500 hover:bg-amber-50 hover:text-amber-600" title="卡片大小">
                    <Grid className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" sideOffset={8}>
                  <DropdownMenuItem onClick={() => setCardSize('small')} className="cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mr-2 ${cardSize === 'small' ? 'bg-amber-500' : 'bg-transparent'}`} />
                    小卡片 (紧凑)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCardSize('medium')} className="cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mr-2 ${cardSize === 'medium' ? 'bg-amber-500' : 'bg-transparent'}`} />
                    中卡片 (标准)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCardSize('large')} className="cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mr-2 ${cardSize === 'large' ? 'bg-amber-500' : 'bg-transparent'}`} />
                    大卡片 (宽敞)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" type="button" className="h-8 rounded-full text-slate-500 font-normal hover:bg-amber-50 hover:text-amber-600">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[10px] mr-1">
                      {currentSort === 'student-id' ? '#' : currentSort?.includes('score') ? 'S' : currentSort?.includes('level') ? 'L' : 'A'}
                    </span>
                    {currentSort === 'student-id' ? '按学号' : currentSort === 'score-desc' ? '按分数降序' : currentSort === 'score-asc' ? '按分数升序' : currentSort === 'level-desc' ? '按等级' : '按首字母'} <SortAsc className="h-3 w-3 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" sideOffset={8}>
                  <DropdownMenuItem onClick={() => onSortChange?.('student-id')} className="cursor-pointer">
                    <Hash className="mr-2 h-4 w-4 text-slate-500" />
                    学号排序
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange?.('name-asc')} className="cursor-pointer">
                    <SortAsc className="mr-2 h-4 w-4 text-slate-500" />
                    姓名拼音
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange?.('score-desc')} className="cursor-pointer">
                    <Star className="mr-2 h-4 w-4 text-amber-500" />
                    分数降序
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange?.('score-asc')} className="cursor-pointer">
                    <Star className="mr-2 h-4 w-4 text-slate-500" />
                    分数升序
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange?.('level-desc')} className="cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4 text-amber-600" />
                    等级排序
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="查找学生(支持拼音)"
                  className="h-8 w-32 md:w-48 rounded-full border-none bg-white px-3 py-1 pl-8 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400 shadow-sm transition-all"
                />
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* Tier 2: Main Actions (Icon + Text) */}
        <div className="flex items-center justify-between px-6 h-16 bg-white">
          {/* Left Actions */}
          <div className="flex items-center gap-6 text-slate-500">
            {classId && (
              <button type="button" onClick={handleOpenSettings} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1 rounded-full group-hover:bg-amber-50 transition-colors"><Settings className="h-5 w-5" /></div>
                <span className="text-[10px] font-medium">班级设置</span>
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                  <div className="p-1 rounded-full group-hover:bg-amber-50 transition-colors h-7 w-7 flex items-center justify-center overflow-hidden">
                    {mounted && session?.user?.image ? (
                      session.user.image === "db-fetch-required" ? (
                        userSettings?.avatar ? (
                          <img src={userSettings.avatar} alt="avatar" className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <UserCircle className="h-5 w-5" />
                        )
                      ) : session.user.image.startsWith('http') || session.user.image.startsWith('/') || session.user.image.startsWith('data:') ? (
                        <img src={session.user.image} alt="avatar" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <span className="text-lg leading-none block">{session.user.image}</span>
                      )
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium max-w-[48px] truncate">
                    {mounted && session?.user?.name ? session.user.name : '账户'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" sideOffset={8}>
                <div className="px-2 py-1.5 text-sm font-medium text-slate-700 border-b mb-1">
                  {session?.user?.name || session?.user?.email || '未登录'}
                </div>
                <DropdownMenuItem className="cursor-pointer" onClick={handleOpenAccountSettings}>
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  账号与安全设置
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center Actions */}
          <div className="flex items-center gap-8 text-slate-600">
            {!classId ? (
              // Actions when NO class is selected (Home page)
              <button onClick={() => setShowCreateDialog(true)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors shadow-sm"><Plus className="h-6 w-6" /></div>
                <span className="text-[12px] font-medium text-amber-600">创建班级</span>
              </button>
            ) : (
              // Actions when a class IS selected
              <>
                <button onClick={() => setShowHistory(true)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-amber-50 transition-colors"><PieChart className="h-5 w-5" /></div>
                <span className="text-[11px] font-medium">班级报表</span>
              </button>
              <button type="button" onClick={handleOpenBatchScore} className={`flex flex-col items-center gap-1 transition-colors group ${isMultiSelectMode ? 'text-amber-600' : 'hover:text-amber-600'}`}>
                <div className={`p-1.5 rounded-full transition-colors shadow-sm ${isMultiSelectMode ? 'bg-amber-100' : 'group-hover:bg-amber-50'}`}><CheckSquare className="h-5 w-5" /></div>
                <span className="text-[11px] font-medium">{isMultiSelectMode ? '取消多选' : '多选'}</span>
              </button>
              <button onClick={() => setShowStore(true)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-amber-50 transition-colors"><Gift className="h-5 w-5" /></div>
                <span className="text-[11px] font-medium">奖励兑换</span>
              </button>
              <button onClick={() => setShowRandomPicker(!showRandomPicker)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-amber-50 transition-colors"><Dices className="h-5 w-5" /></div>
                <span className="text-[11px] font-medium">随机</span>
              </button>
              <button onClick={() => setShowTimer(!showTimer)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-amber-50 transition-colors"><Timer className="h-5 w-5" /></div>
                <span className="text-[11px] font-medium">计时器</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-amber-50 transition-colors"><Wrench className="h-5 w-5" /></div>
                    <span className="text-[11px] font-medium">小工具</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" sideOffset={8}>
                  <DropdownMenuItem onClick={() => setShowDecibel(!showDecibel)} className="cursor-pointer">
                    <Mic className="mr-2 h-4 w-4 text-slate-500" />
                    分贝仪
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-slate-500">
            {classId && (
              <button onClick={() => setShowHonorRoll(true)} className="flex flex-col items-center gap-1 hover:text-amber-600 transition-colors group">
                <div className="p-1 rounded-full group-hover:bg-amber-50 text-amber-500 transition-colors"><Trophy className="h-6 w-6" /></div>
                <span className="text-[10px] font-medium text-amber-600">光荣榜</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Account Settings Dialog */}
      <AccountSettingsDialog 
        open={showAccountSettings} 
        onOpenChange={setShowAccountSettings} 
      />

      {/* Dialogs that are opened by the header buttons */}
      <CreateClassDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleSuccess}
      />
      <HonorRollDialog open={showHonorRoll} onOpenChange={setShowHonorRoll} classId={classId} />
      <StoreDialog open={showStore} onOpenChange={setShowStore} classId={classId} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} classId={classId} />
      <HistoryDialog open={showHistory} onOpenChange={setShowHistory} classId={classId} />
      {/* BatchScoreDialog needs students data, which header doesn't have. This needs further thought,
          for now passing an empty array to avoid errors. */}
      <BatchScoreDialog open={showBatchScore} onOpenChange={setShowBatchScore} students={[]} />

      {/* PIN Verification Dialogs */}
      <PinVerifyDialog 
        open={showPinVerifyForAccount} 
        onOpenChange={setShowPinVerifyForAccount}
        onSuccess={() => {
          setShowAccountSettings(true);
        }}
        title="账号安全验证"
        description="请输入老师的 PIN 码以进入安全设置"
      />
      <PinVerifyDialog 
        open={showPinVerifyForSettings} 
        onOpenChange={setShowPinVerifyForSettings}
        onSuccess={() => {
          setShowSettings(true);
        }}
        title="设置权限已锁定"
        description="请输入老师的 PIN 码以进入班级设置面板"
      />
      <PinVerifyDialog 
        open={showPinVerifyForScoring} 
        onOpenChange={setShowPinVerifyForScoring}
        onSuccess={() => {
          setShowBatchScore(true);
        }}
        title="加减分已锁定"
        description="请输入老师的 PIN 码以进行打分操作"
      />

      {/* Widgets (Floating & Draggable) */}
      {showTimer && <TimerWidget onClose={() => setShowTimer(false)} />}
      {showRandomPicker && classId && <RandomPickerWidget classId={classId} onClose={() => setShowRandomPicker(false)} />}
      {showDecibel && <DecibelWidget onClose={() => setShowDecibel(false)} />}
    </>
  );
}
