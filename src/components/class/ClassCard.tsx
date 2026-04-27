'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Copy, Settings, Trash2, Loader2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import type { Class } from '@prisma/client';


interface ClassWithStudentCount extends Class {
  _count?: {
    students: number;
  };
}

interface ClassCardProps {
  classItem: ClassWithStudentCount;
  onSettingsClick?: (classId: string) => void;
  onDelete?: (classId: string) => void;
}

export function ClassCard({ classItem, onSettingsClick, onDelete }: ClassCardProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClassClick = () => {
    router.push(`/class/${classItem.id}`);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicating(true);
    try {
      const response = await fetch(`/api/classes/${classItem.id}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate class');
      }
      toast.success('班级复制成功');
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error('复制班级失败');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/classes/${classItem.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('班级删除成功');
        onDelete?.(classItem.id);
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error('班级删除失败');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('班级删除失败');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card
      key={classItem.id}
      className="cursor-pointer transition-all duration-200 hover:border-amber-400 group relative rounded-xl border-slate-200/60 overflow-hidden bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md"
      onClick={handleClassClick}
    >
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="absolute right-3 top-4 z-10" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onSettingsClick?.(classItem.id)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>班级设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
              {isDuplicating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              <span>复制班级</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={handleDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>删除班级</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-3xl shadow-sm border border-amber-200/50 overflow-hidden flex-shrink-0">
            {classItem.logo ? (
              classItem.logo.startsWith('http') || classItem.logo.startsWith('/') || classItem.logo.startsWith('data:') ? (
                <img src={classItem.logo} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <span>{classItem.logo}</span>
              )
            ) : (
              <span>🐾</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-800 truncate pr-6">{classItem.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                <Users className="w-3 h-3 mr-1" />
                {classItem._count?.students || 0} 名学生
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要删除该班级吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将永久删除班级 <strong>{classItem.name}</strong> 及其所有学生、宠物、加扣分记录等数据。该操作不可恢复！
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>取消</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteConfirm();
            }} 
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
