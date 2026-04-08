"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Book, Info } from "lucide-react";

export function HelpSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Book className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">使用说明</h3>
              <p className="text-sm text-muted-foreground">快速上手指南</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>1. 创建班级后，点击班级卡片进入班级管理</p>
            <p>2. 点击右下角 + 按钮添加学生</p>
            <p>3. 为学生选择守护宠物</p>
            <p>4. 使用评分按钮进行加减分操作</p>
            <p>5. 学生积分可以兑换小商店商品</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
