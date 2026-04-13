"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  level: number;
  periodScore: number;
  totalScore: number;
  badges?: { id: string }[];
  pet?: {
    id: string;
    name: string;
    level: number;
    image: string;
  } | null;
}

interface HonorRollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
}

export function HonorRollDialog({ open, onOpenChange, classId }: HonorRollDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "semester">("week");

  useEffect(() => {
    if (open && classId) {
      fetchHonorRoll(period);
    }
  }, [open, classId, period]);

  const fetchHonorRoll = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/honor-roll?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch honor roll:", error);
      toast.error("加载荣誉榜失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-6 h-6 text-amber-500" />
                班级荣誉榜
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                看看谁是班级里最闪耀的星！只有存活的宠物才能上榜哦。
              </DialogDescription>
            </div>
            <Tabs value={period} onValueChange={(v: any) => setPeriod(v)} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">本周</TabsTrigger>
                <TabsTrigger value="month">本月</TabsTrigger>
                <TabsTrigger value="semester">本学期</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        <ScrollArea className=”flex-1 min-h-0 mt-4”>
          {loading ? (
          <div className=”py-12 text-center”>
            <p className=”text-muted-foreground”>加载中...</p>
          </div>
        ) : students.length === 0 ? (
          <div className=”py-12 text-center”>
            <Medal className=”w-16 h-16 mx-auto text-muted-foreground mb-4” />
            <p className=”text-muted-foreground”>暂无排行数据</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className=”sticky top-0 bg-white z-10 shadow-sm”>
                <TableRow>
                  <TableHead className=”w-20 text-center”>排名</TableHead>
                  <TableHead>学生</TableHead>
                  <TableHead>守护宠物</TableHead>
                  <TableHead className=”text-right”>当前期成长值</TableHead>
                  <TableHead className=”text-right”>宠物等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 10).map((student, index) => (
                  <TableRow key={student.id} className={index < 3 ? “bg-amber-50/30” : “”}>
                    <TableCell>
                      <div className=”flex items-center justify-center”>
                        {index === 0 && <span className=”text-3xl” title=”宠物之星”>👑</span>}
                        {index === 1 && <span className=”text-2xl”>🥈</span>}
                        {index === 2 && <span className=”text-2xl”>🥉</span>}
                        {index > 2 && (
                          <span className=”text-lg font-medium text-slate-500”>{index + 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className=”font-medium text-base”>
                      {student.name}
                      {index < 3 && period === “month” && (
                        <Badge variant=”secondary” className=”ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100”>宠物之星</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.pet && (
                        <div className=”flex items-center gap-2”>
                          <div className=”w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border”>
                            {student.pet.image ? (
                              student.pet.image.startsWith('http') || student.pet.image.startsWith('/') || student.pet.image.startsWith('data:') ? (
                                <img src={student.pet.image} alt={student.pet.name} className=”w-full h-full object-cover” />
                              ) : (
                                <span className=”text-lg”>{student.pet.image}</span>
                              )
                            ) : (
                              <span>🐾</span>
                            )}
                          </div>
                          <span className=”text-sm text-slate-600”>{student.pet.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className=”text-right”>
                      <span className=”font-bold text-amber-600 text-lg”>+{student.periodScore}</span>
                    </TableCell>
                    <TableCell className=”text-right”>
                      <Badge variant=”outline” className=”bg-slate-50”>
                        Lv.{student.pet?.level || 1}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 关于徽章说明 */}
            <Card className=”mt-4 border bg-amber-50/50”>
              <CardContent className=”pt-4”>
                <div className=”flex items-start gap-3”>
                  <div className=”w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0”>
                    <span className=”text-lg”>⭐</span>
                  </div>
                  <div>
                    <h4 className=”font-semibold mb-1 text-amber-900”>榜单规则</h4>
                    <ul className=”text-sm text-amber-800/80 list-disc ml-4 space-y-1”>
                      <li><strong>上榜条件</strong>：宠物必须存活。已阵亡的宠物将移出排行榜。</li>
                      <li><strong>积分统计</strong>：仅统计当前周期内（本周/本月/本学期）新增的<strong>正向加分</strong>，扣分不影响排名。</li>
                      <li><strong>宠物之星</strong>：月榜前 3 名将获得专属”宠物之星”荣誉称号。</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
