import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Upload, UserMinus } from "lucide-react";
import { CreateStudentDialog } from "@/components/student/CreateStudentDialog";
import { BatchImportDialog } from "@/components/student/BatchImportDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
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
import type { Student, Pet } from "@prisma/client";

interface StudentWithPet extends Student {
  pet: Pet | null;
}

interface ClassManagementProps {
  classId: string;
}

export function ClassManagement({ classId }: ClassManagementProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchImportDialog, setShowBatchImportDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      const res = await fetch(`/api/students/${studentToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("学生已删除");
        fetchStudents();
        // Also trigger the main list refresh if it's open behind the dialog
        if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
          (window as any).refreshStudentList();
        }
        // Force Next.js to re-fetch the server component to update the layout/list
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete student", error);
      toast.error("删除失败");
    } finally {
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">学生名单</h3>
          <p className="text-sm text-muted-foreground">管理班级中的学生，可以单个添加或批量导入</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBatchImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加学生
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">头像</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>学号</TableHead>
              <TableHead>当前分数</TableHead>
              <TableHead>宠物状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  加载中...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  暂无学生，请先添加
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      {student.pet?.image ? (
                        <AvatarImage src={student.pet.image} alt={student.name} />
                      ) : null}
                      <AvatarFallback className="text-xs bg-amber-100">
                        {student.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentNo || '-'}</TableCell>
                  <TableCell>{student.score}</TableCell>
                  <TableCell>
                    {student.pet ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${student.pet.isDead ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {student.pet.isDead ? '已阵亡' : `Lv.${student.pet.level} (健康:${student.pet.health})`}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">未领养</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setStudentToDelete(student.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        classId={classId}
        onStudentCreated={() => {
          fetchStudents();
          if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
            (window as any).refreshStudentList();
          }
          setTimeout(() => {
            router.refresh();
          }, 100);
        }}
      />

      <BatchImportDialog
        open={showBatchImportDialog}
        onOpenChange={setShowBatchImportDialog}
        classId={classId}
        onSuccess={() => {
          fetchStudents();
          if (typeof window !== 'undefined' && (window as any).refreshStudentList) {
            (window as any).refreshStudentList();
          }
          setTimeout(() => {
            router.refresh();
          }, 100);
        }}
      />

      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除该学生吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该学生的所有记录和专属宠物。该操作不可恢复！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
