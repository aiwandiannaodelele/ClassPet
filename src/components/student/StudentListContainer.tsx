'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Users, Grid } from 'lucide-react';
import { StudentList } from './StudentList';
import { CreateStudentDialog } from './CreateStudentDialog';
import { BatchImportDialog } from './BatchImportDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupManagement } from '@/components/group/GroupManagement';
import { ScoreDialog } from '@/components/score/ScoreDialog';
import { pinyin } from 'pinyin-pro';
import { toast } from 'sonner';
import type { Pet, Student, Group } from '@prisma/client';

interface StudentWithPet extends Student {
  pet: Pet | null;
  group?: Group | null;
}

import { useContext } from 'react';
import { SortContext, ViewModeContext, SelectionContext, SearchContext } from '@/app/(dashboard)/layout';

interface StudentListContainerProps {
  classId: string;
  initialStudents: StudentWithPet[];
}

export function StudentListContainer({ classId, initialStudents }: StudentListContainerProps) {
  const [students, setStudents] = useState<StudentWithPet[]>(initialStudents);
  const { currentSort } = useContext(SortContext);
  const { searchQuery } = useContext(SearchContext);
  const { viewMode } = useContext(ViewModeContext);
  const { isMultiSelectMode, selectedStudentIds, toggleMultiSelectMode, toggleStudentSelection, clearSelection } = useContext(SelectionContext);

  const [showBatchScoreDialog, setShowBatchScoreDialog] = useState(false);

  // Function to manually refetch students (useful when we don't want to rely solely on router.refresh)
  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/students`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  // Expose to window so other components can trigger a refresh of the student list
  useEffect(() => {
    (window as any).refreshStudentList = fetchStudents;
    return () => {
      delete (window as any).refreshStudentList;
    };
  }, [classId]);

  // Sync state when initialStudents props change due to router.refresh()
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const sortedStudents = useMemo(() => {
    let filtered = [...students];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => {
        // Match exact name or studentNo
        if (s.name.toLowerCase().includes(query) || (s.studentNo && s.studentNo.toLowerCase().includes(query))) return true;
        
        // Pinyin match
        const pinyinArr = pinyin(s.name, { toneType: 'none', type: 'array' });
        const pinyinFull = pinyinArr.join('');
        const pinyinFirstLetters = pinyinArr.map(p => p[0]).join('');
        
        return pinyinFull.includes(query) || pinyinFirstLetters.includes(query);
      });
    }

    return filtered.sort((a, b) => {
      // Map sort options from Header to actual sorting logic
      if (currentSort === 'score-desc') {
        return b.score - a.score;
      }
      if (currentSort === 'score-asc') {
        return a.score - b.score;
      }
      if (currentSort === 'level-desc') {
        const levelA = a.pet?.level || 0;
        const levelB = b.pet?.level || 0;
        return levelB - levelA;
      }
      if (currentSort === 'name-asc') {
        // Use pinyin-pro for Chinese pinyin sorting
        const pinyinA = pinyin(a.name, { toneType: 'none', type: 'array' }).join('');
        const pinyinB = pinyin(b.name, { toneType: 'none', type: 'array' }).join('');
        return pinyinA.localeCompare(pinyinB);
      }
      
      // default: student-id
      const noA = a.studentNo || a.id;
      const noB = b.studentNo || b.id;
      
      // Try to sort numerically if they are numbers
      const numA = parseInt(noA, 10);
      const numB = parseInt(noB, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      return noA.localeCompare(noB);
    });
  }, [students, currentSort, searchQuery]);

  const handleStudentCreated = async () => {
    // Refresh the student list
    try {
      const res = await fetch(`/api/classes/${classId}/students`, { cache: 'no-store' });
      if (res.ok) {
        const newStudents = await res.json();
        setStudents(newStudents);
      }
    } catch (error) {
      console.error('Failed to refresh students:', error);
    }
  };

  const handleBatchScoreComplete = () => {
    fetchStudents();
    clearSelection();
    toggleMultiSelectMode();
  };

  const handleSelectAll = () => {
    const selectableStudents = sortedStudents.filter(s => s.pet && !s.pet.isDead);
    if (selectedStudentIds.length === selectableStudents.length) {
      clearSelection();
    } else {
      selectableStudents.forEach(s => {
        if (!selectedStudentIds.includes(s.id)) {
          toggleStudentSelection(s.id);
        }
      });
    }
  };

  return (
    <div className="relative pb-16">
      {viewMode === 'students' ? (
        <div className="mt-0">
          <StudentList students={sortedStudents} />
        </div>
      ) : (
        <div className="mt-0">
          <GroupManagement 
            classId={classId} 
            students={sortedStudents} 
            onUpdate={handleStudentCreated} 
          />
        </div>
      )}

      {/* Floating Action Bar for Multi-Select */}
      {isMultiSelectMode && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">
              {selectedStudentIds.length}
            </span>
            <span>已选择</span>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleSelectAll}
          >
            {selectedStudentIds.length > 0 && selectedStudentIds.length === sortedStudents.filter(s => s.pet && !s.pet.isDead).length ? '取消全选' : '全选可用'}
          </Button>

          <Button 
            size="sm" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium ml-2 shadow-sm"
            onClick={() => {
              if (selectedStudentIds.length === 0) {
                toast.error('请至少选择一名学生');
                return;
              }
              setShowBatchScoreDialog(true);
            }}
          >
            批量喂食/惩罚
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-white hover:bg-slate-800 ml-1 rounded-full px-3"
            onClick={toggleMultiSelectMode}
          >
            退出
          </Button>
        </div>
      )}

      {/* Reusing ScoreDialog for Batch Scoring */}
      {showBatchScoreDialog && (
        <ScoreDialog
          open={showBatchScoreDialog}
          onOpenChange={setShowBatchScoreDialog}
          studentIds={selectedStudentIds}
          studentNames={selectedStudentIds.map(id => students.find(s => s.id === id)?.name || '未知')}
          classId={classId}
          onScoreComplete={handleBatchScoreComplete}
        />
      )}
    </div>
  );
}
