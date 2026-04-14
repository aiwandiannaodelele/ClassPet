'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import type { Class } from '@prisma/client';

// Create contexts to share state
export const SortContext = createContext({
  currentSort: 'student-id',
  setCurrentSort: (sort: string) => {},
});
export const SearchContext = createContext({
  searchQuery: '',
  setSearchQuery: (query: string) => {},
});
export const CardSizeContext = createContext({
  cardSize: 'medium' as 'small' | 'medium' | 'large',
  setCardSize: (size: 'small' | 'medium' | 'large') => {},
});
export const ViewModeContext = createContext<{ viewMode: string, setViewMode: (mode: string) => void }>({ viewMode: 'students', setViewMode: () => {} });
export const SelectionContext = createContext<{
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  toggleMultiSelectMode: () => void;
  toggleStudentSelection: (id: string) => void;
  clearSelection: () => void;
}>({
  isMultiSelectMode: false,
  selectedStudentIds: [],
  toggleMultiSelectMode: () => {},
  toggleStudentSelection: () => {},
  clearSelection: () => {},
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState('student-id');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSize, setCardSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [viewMode, setViewMode] = useState<string>('students');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Load card size from localStorage on mount
  useEffect(() => {
    const savedSize = localStorage.getItem('cardSize') as 'small' | 'medium' | 'large' | null;
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) {
      setCardSizeState(savedSize);
    }
  }, []);

  // Save card size to localStorage when it changes
  const setCardSize = (size: 'small' | 'medium' | 'large') => {
    setCardSizeState(size);
    localStorage.setItem('cardSize', size);
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(prev => {
      if (prev) {
        setSelectedStudentIds([]); // Clear selection when exiting
      }
      return !prev;
    });
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('加载班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    
    const handleClassUpdate = () => {
      fetchClasses();
    };
    
    window.addEventListener('class-updated', handleClassUpdate);
    return () => {
      window.removeEventListener('class-updated', handleClassUpdate);
    };
  }, []);

  return (
    <SelectionContext.Provider value={{ isMultiSelectMode, selectedStudentIds, toggleMultiSelectMode, toggleStudentSelection, clearSelection }}>
    <SortContext.Provider value={{ currentSort, setCurrentSort }}>
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
    <CardSizeContext.Provider value={{ cardSize, setCardSize }}>
      <div
        className="min-h-screen pb-[112px] bg-slate-50/50 overflow-y-auto"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <Header 
          classes={classes} 
          onClassCreated={fetchClasses} 
          currentSort={currentSort}
          onSortChange={setCurrentSort}
          currentView={viewMode}
          onViewChange={setViewMode}
        />
        <main className="w-full py-4">
          {/* We can add a global loading state here if needed */}
          <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
            {children}
          </ViewModeContext.Provider>
        </main>
      </div>
    </CardSizeContext.Provider>
    </SearchContext.Provider>
    </SortContext.Provider>
    </SelectionContext.Provider>
  );
}
