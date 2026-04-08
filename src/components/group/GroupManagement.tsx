"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Plus, Users, Trash2, Edit2, Check, X, Star, Settings, 
  Layers, LayoutGrid, UserPlus, Trophy,
  MoreVertical, Activity, ArrowRightLeft,
  UtensilsCrossed
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { GroupScoreDialog } from "@/components/score/GroupScoreDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardSizeContext } from "@/app/(dashboard)/layout";

interface GroupManagementProps {
  classId: string;
  students: any[];
  onUpdate: () => void;
}

export function GroupManagement({ classId, students, onUpdate }: GroupManagementProps) {
  const router = useRouter();
  const { cardSize } = useContext(CardSizeContext);
  const [archives, setArchives] = useState<any[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [isCreatingArchive, setIsCreatingArchive] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState("");
  const [isEditingArchive, setIsEditingArchive] = useState(false);
  const [editingArchiveName, setEditingArchiveName] = useState("");

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [scoringGroup, setScoringGroup] = useState<{id: string, name: string} | null>(null);

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  const [archiveToDelete, setArchiveToDelete] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const fetchArchives = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/archives`);
      if (res.ok) {
        const data = await res.json();
        setArchives(data);
        if (data.length > 0 && !selectedArchiveId) {
          const active = data.find((a: any) => a.isActive) || data[0];
          setSelectedArchiveId(active.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch archives", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [classId]);

  const selectedArchive = archives.find(a => a.id === selectedArchiveId);
  const groups = selectedArchive?.groups || [];

  const handleCreateArchive = async () => {
    if (!newArchiveName.trim()) return;
    try {
      const res = await fetch(`/api/classes/${classId}/archives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newArchiveName.trim() })
      });
      if (res.ok) {
        const newArchive = await res.json();
        setNewArchiveName("");
        setIsCreatingArchive(false);
        setSelectedArchiveId(newArchive.id);
        fetchArchives();
        toast.success("方案创建成功");
      }
    } catch (error) {
      toast.error("创建失败");
    }
  };

  const handleUpdateArchive = async () => {
    if (!editingArchiveName.trim() || !selectedArchiveId) return;
    try {
      const res = await fetch(`/api/archives/${selectedArchiveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingArchiveName.trim() })
      });
      if (res.ok) {
        setIsEditingArchive(false);
        fetchArchives();
        toast.success("方案重命名成功");
      }
    } catch (error) {
      toast.error("重命名失败");
    }
  };

  const handleDeleteArchive = async (archiveId: string) => {
    try {
      const res = await fetch(`/api/archives/${archiveId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedArchiveId === archiveId) {
          setSelectedArchiveId("");
        }
        fetchArchives();
        toast.success("方案已删除");
      }
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setArchiveToDelete(null);
    }
  };

  const handleSetActiveArchive = async () => {
    if (!selectedArchiveId) return;
    try {
      const res = await fetch(`/api/archives/${selectedArchiveId}/active`, { method: "PUT" });
      if (res.ok) {
        fetchArchives();
        toast.success("已设为默认方案");
      }
    } catch (error) {
      toast.error("设置失败");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !selectedArchiveId) return;
    try {
      const res = await fetch(`/api/archives/${selectedArchiveId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (res.ok) {
        setNewGroupName("");
        setIsCreatingGroup(false);
        fetchArchives();
        toast.success("小组创建成功");
      }
    } catch (error) {
      toast.error("创建失败");
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    if (!editingGroupName.trim()) return;
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingGroupName.trim() })
      });
      if (res.ok) {
        setEditingGroupId(null);
        fetchArchives();
        toast.success("更新成功");
      }
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      if (res.ok) {
        fetchArchives();
        onUpdate();
        toast.success("小组已删除");
      }
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setGroupToDelete(null);
    }
  };

  const openAssignDialog = (groupId: string, currentStudentIds: string[]) => {
    setSelectedGroupId(groupId);
    setSelectedStudentIds(currentStudentIds);
    setShowAssignDialog(true);
  };

  const handleAssignStudents = async () => {
    if (!selectedGroupId) return;
    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });
      if (res.ok) {
        setShowAssignDialog(false);
        fetchArchives();
        onUpdate();
        toast.success("成员分配成功");
      }
    } catch (error) {
      toast.error("分配失败");
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">加载中...</div>;

  const studentToGroupMap = new Map<string, string>();
  groups.forEach((g: any) => {
    g.students.forEach((s: any) => {
      studentToGroupMap.set(s.id, g.id);
    });
  });

  return (
    <div className="space-y-6 mt-4 px-2">
      {/* 顶部工具栏 - 原生 Shadcn 样式 */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b pb-6 px-1">
        <div className="flex items-center gap-2">
          {isEditingArchive ? (
            <div className="flex items-center gap-2">
              <Input 
                value={editingArchiveName} 
                onChange={(e) => setEditingArchiveName(e.target.value)}
                className="h-9 w-[200px]"
                autoFocus
              />
              <Button size="sm" onClick={handleUpdateArchive}>
                保存
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingArchive(false)}>
                取消
              </Button>
            </div>
          ) : (
            <>
              <Select value={selectedArchiveId} onValueChange={setSelectedArchiveId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="选择分组方案" />
                </SelectTrigger>
                <SelectContent>
                  {archives.map(archive => (
                    <SelectItem key={archive.id} value={archive.id}>
                      {archive.name} {archive.isActive && "(默认)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setEditingArchiveName(selectedArchive?.name); setIsEditingArchive(true); }}>
                    重命名方案
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSetActiveArchive} disabled={selectedArchive?.isActive}>
                    设为默认方案
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setArchiveToDelete(selectedArchiveId)}>
                    删除方案
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCreatingArchive ? (
            <div className="flex items-center gap-2">
              <Input 
                placeholder="方案名称" 
                value={newArchiveName}
                onChange={(e) => setNewArchiveName(e.target.value)}
                className="h-9 w-[150px]"
              />
              <Button size="sm" onClick={handleCreateArchive}>创建</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreatingArchive(false)}>取消</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsCreatingArchive(true)}>
              <Plus className="mr-2 h-4 w-4" /> 新建方案
            </Button>
          )}
          
          <Button size="sm" onClick={() => setIsCreatingGroup(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> 添加小组
          </Button>
        </div>
      </div>

      {isCreatingGroup && (
        <Card className="border-dashed">
          <CardContent className="pt-6 flex items-center gap-4">
            <Input 
              placeholder="输入小组名称" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateGroup}>确认添加</Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsCreatingGroup(false); setNewGroupName(""); }}>取消</Button>
          </CardContent>
        </Card>
      )}

      {/* 小组网格 - 支持大小设置 */}
      <div className={`grid gap-4 ${
        cardSize === 'small' 
          ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
          : cardSize === 'large'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
      }`}>
        {groups.map((group: any) => {
          const groupScore = group.students.reduce((acc: number, s: any) => acc + s.score, 0);
          const aliveCount = group.students.filter((s: any) => s.pet && !s.pet.isDead).length;

          return (
            <Card key={group.id} className="flex flex-col shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input value={editingGroupName} onChange={(e) => setEditingGroupName(e.target.value)} className="h-8" autoFocus />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdateGroup(group.id)}><Check className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingGroupId(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-base font-bold truncate">{group.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAssignDialog(group.id, group.students.map((s: any) => s.id))}>
                            管理成员
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name); }}>
                            重命名
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setGroupToDelete(group.id)}>
                            解散小组
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>积分: <span className="font-bold text-foreground">{groupScore}</span></span>
                  <span>存活: <span className="font-bold text-foreground">{aliveCount}/{group.students.length}</span></span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-4">
                <ScrollArea className={`${cardSize === 'small' ? 'h-[60px]' : 'h-[100px]'} border rounded-md p-2 bg-slate-50/50`}>
                  <div className="flex flex-wrap gap-1">
                    {group.students.map((student: any) => (
                      <Badge 
                        key={student.id} 
                        variant="secondary" 
                        className={`text-[10px] px-1.5 py-0 font-normal ${student.pet?.isDead ? 'opacity-50' : ''}`}
                      >
                        {student.name}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>

                <Button 
                  size="sm"
                  className="w-full h-9"
                  onClick={() => { setScoringGroup({id: group.id, name: group.name}); setShowScoreDialog(true); }}
                  disabled={group.students.length === 0}
                >
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  喂食小组
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 成员分配对话框 */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>管理小组成员</DialogTitle>
            <DialogDescription>选择属于该小组的学生</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] my-4 pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {students.map(student => {
                  const isCurrent = selectedStudentIds.includes(student.id);
                  const otherGroupId = studentToGroupMap.get(student.id);
                  const isOther = otherGroupId && otherGroupId !== selectedGroupId;

                  return (
                    <div 
                      key={student.id} 
                      className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-slate-50 ${isCurrent ? 'bg-slate-50 border-primary' : ''}`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <Checkbox checked={isCurrent} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{student.name}</div>
                        {isOther && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            所属: {groups.find((g: any) => g.id === otherGroupId)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAssignDialog(false)}>取消</Button>
            <Button onClick={handleAssignStudents}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Score Dialog */}
      {scoringGroup && (
        <GroupScoreDialog
          open={showScoreDialog}
          onOpenChange={setShowScoreDialog}
          groupId={scoringGroup.id}
          groupName={scoringGroup.name}
          classId={classId}
          onScoreComplete={() => {
            fetchArchives();
            router.refresh();
          }}
        />
      )}

      {/* 删除确认 */}
      <AlertDialog open={!!archiveToDelete} onOpenChange={(open) => !open && setArchiveToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除方案？</AlertDialogTitle>
            <AlertDialogDescription>这将移除该方案下的所有小组，且不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveToDelete && handleDeleteArchive(archiveToDelete)}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定解散小组？</AlertDialogTitle>
            <AlertDialogDescription>成员将变为未分配状态。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => groupToDelete && handleDeleteGroup(groupToDelete)}>确认解散</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
