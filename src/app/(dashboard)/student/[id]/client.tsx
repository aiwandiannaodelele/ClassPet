"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

interface StudentDetail {
  id: string;
  name: string;
  score: number;
  totalScore: number;
  coins: number;
  classId: string;
  class: {
    name: string;
    petResetCost: number;
  };
  pet: {
    id: string;
    name: string;
    image: string;
    level: number;
    health: number;
    isDead: boolean;
    reviveCount: number;
  } | null;
  records: any[];
  exchanges: any[];
}

interface StudentDetailClientProps {
  student: StudentDetail;
}

export default function StudentDetailClient({ student }: StudentDetailClientProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const progressValue = student.score % 100;
  const resetCost = student.class?.petResetCost ?? 20;

  const handleResetPet = async () => {
    if (student.score < resetCost) {
      toast.error("成长值不足");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`/api/students/${student.id}/pet/reset`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success("宠物已重置，等级和健康值已恢复");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "重置失败");
      }
    } catch (error) {
      toast.error("重置失败，请重试");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-xl font-bold">{student.name} - 宠物档案</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>宠物信息</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            {student.pet ? (
              <>
                <div className="h-32 w-32 flex items-center justify-center">
                  {student.pet.image?.startsWith('http') || student.pet.image?.startsWith('/') ? (
                    <img src={student.pet.image} alt={student.pet.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-6xl">{student.pet.image || '🐾'}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{student.pet.name}</h2>
                <div className="w-full space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">等级</span>
                    <Badge variant="outline">Lv. {student.pet.level}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">健康值</span>
                      <span className={`font-bold ${student.pet.health > 20 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.pet.health}/100
                      </span>
                    </div>
                    <Progress 
                      value={student.pet.health} 
                      className="h-2 bg-slate-100" 
                      indicatorClassName={student.pet.health > 20 ? "bg-green-500" : "bg-red-500"} 
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">状态</span>
                    <span className={student.pet.isDead ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                      {student.pet.isDead ? '💀 阵亡' : '❤️ 存活'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-muted-foreground">
                <div className="text-5xl mb-3">🥚</div>
                <p>尚未领养宠物</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>学生信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">姓名</span>
                <span className="font-semibold">{student.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">班级</span>
                <span className="font-semibold">{student.class?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">成长值</span>
                <span className="font-bold text-amber-600">{student.score}</span>
              </div>
              <Progress value={progressValue} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
            </div>

            {student.pet && (
              <div className="pt-4 border-t">
                <Card className="border-red-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-600 flex items-center gap-2 text-base">
                      <RotateCcw className="w-4 h-4" />
                      重置宠物
                    </CardTitle>
                    <CardDescription className="text-xs">
                      重置后宠物等级归零，健康值恢复100，宠物保持不变。
                      每次重置消耗 <span className="font-bold text-amber-600">{resetCost}</span> 成长值。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleResetPet}
                      disabled={student.score < resetCost || isResetting}
                    >
                      {isResetting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2" />
                      )}
                      确认重置 (消耗 {resetCost} 成长值)
                    </Button>
                    {student.score < resetCost && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        成长值不足，需要 {resetCost} 点
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>历史记录</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="scores" className="w-full flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scores">评价记录 ({student.records?.length || 0})</TabsTrigger>
              <TabsTrigger value="exchanges">兑换记录 ({student.exchanges?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="scores" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {student.records && student.records.length > 0 ? (
                  <div className="space-y-3">
                    {student.records.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{record.rule?.name || '未知规则'}</span>
                            <Badge variant="secondary" className="text-xs">{record.rule?.category}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(record.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                          </div>
                        </div>
                        <div className={`font-bold text-lg ${record.scoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.scoreChange > 0 ? '+' : ''}{record.scoreChange}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                    <p>暂无评价记录</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="exchanges" className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {student.exchanges && student.exchanges.length > 0 ? (
                  <div className="space-y-3">
                    {student.exchanges.map((exchange: any) => (
                      <div key={exchange.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{exchange.product?.icon || '🎁'}</div>
                          <div>
                            <div className="font-medium">{exchange.product?.name || '未知商品'}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(exchange.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-red-600">
                          -{exchange.product?.price || 0} 积分
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                    <p>暂无兑换记录</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
