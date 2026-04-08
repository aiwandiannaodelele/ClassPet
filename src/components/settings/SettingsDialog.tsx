"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RuleManagement } from "@/components/rule/RuleManagement";
import { GrowthSettings } from "./GrowthSettings";
import { DataManagement } from "./DataManagement";
import { HelpSection } from "./HelpSection";
import { ClassManagement } from "./ClassManagement";
import { AboutSection } from "./AboutSection";
import { UserAgreementSection } from "./UserAgreementSection";
import { Users, FileSpreadsheet, Settings as SettingsIcon, FileText } from "lucide-react";
import { ClassParamsSettings } from "./ClassParamsSettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
}

export function SettingsDialog({ open, onOpenChange, classId }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-700" />
            班级设置与管理
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={classId ? "students" : "help"} className="flex-1">
          <TabsList className="grid w-full grid-cols-9 mb-4">
            <TabsTrigger value="students" disabled={!classId}>学生名单</TabsTrigger>
            <TabsTrigger value="classParams" disabled={!classId}>班级参数</TabsTrigger>
            <TabsTrigger value="survivalParams" disabled={!classId}>生存惩罚</TabsTrigger>
            <TabsTrigger value="rules" disabled={!classId}>规则管理</TabsTrigger>
            <TabsTrigger value="growth" disabled={!classId}>成长设置</TabsTrigger>
            <TabsTrigger value="data" disabled={!classId}>数据管理</TabsTrigger>
            <TabsTrigger value="agreement">用户协议</TabsTrigger>
            <TabsTrigger value="help">帮助文档</TabsTrigger>
            <TabsTrigger value="about">关于软件</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <ClassManagement classId={classId} /> : null}
          </TabsContent>

          <TabsContent value="classParams" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <ClassParamsSettings classId={classId} showOnly="basic" /> : null}
          </TabsContent>

          <TabsContent value="survivalParams" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <ClassParamsSettings classId={classId} showOnly="survival" /> : null}
          </TabsContent>

          <TabsContent value="rules" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <RuleManagement classId={classId} /> : null}
          </TabsContent>

          <TabsContent value="growth" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <GrowthSettings classId={classId} /> : null}
          </TabsContent>

          <TabsContent value="data" className="h-[65vh] overflow-y-auto px-1">
            {classId ? <DataManagement classId={classId} /> : null}
          </TabsContent>

          <TabsContent value="agreement" className="h-[65vh] overflow-y-auto px-1">
            <UserAgreementSection />
          </TabsContent>

          <TabsContent value="help" className="h-[65vh] overflow-y-auto px-1">
            <HelpSection />
          </TabsContent>

          <TabsContent value="about" className="h-[65vh] overflow-y-auto px-1">
            <AboutSection />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
