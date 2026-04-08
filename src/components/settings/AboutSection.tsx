"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>关于 萌宠班级屋</CardTitle>
          <CardDescription>版本信息与开发团队</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">版本信息</span>
            <span className="font-mono text-slate-700">v1.0.0 (Release)</span>
          </div>
          
          <div className="py-2 border-b border-slate-100">
            <span className="block text-slate-500 font-medium mb-2">项目愿景</span>
            <span className="text-slate-700 text-sm leading-relaxed block">
              萌宠班级屋是一个专为班级管理打造的互动系统。通过引入可爱的宠物养成机制和积分系统，
              旨在激发学生的学习积极性，让班级管理变得更加生动有趣。
            </span>
          </div>

          <div className="py-2 border-b border-slate-100">
            <span className="block text-slate-500 font-medium mb-2">技术架构</span>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              <li>前端：Next.js 15, React, TailwindCSS, shadcn/ui</li>
              <li>后端：Next.js App Router, Prisma ORM</li>
              <li>数据库：SQLite / PostgreSQL</li>
            </ul>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">开发者</span>
            <span className="text-slate-700">aiwandiannaodelele / 龚奕帆</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 font-medium">开源协议</span>
            <span className="text-slate-700 text-sm">GNU Affero General Public License v3.0 (AGPL-3.0)</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-slate-400 mt-8">
        &copy; {new Date().getFullYear()} 萌宠班级屋. All rights reserved.
      </div>
    </div>
  );
}