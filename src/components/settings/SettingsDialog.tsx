"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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

        <Tabs defaultValue={classId ? "students" : "help"} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-9 mb-4 flex-shrink-0">
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

          <TabsContent value="students" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              {classId ? <ClassManagement classId={classId} /> : null}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="classParams" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              {classId ? <ClassParamsSettings classId={classId} showOnly="basic" /> : null}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="survivalParams" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              {classId ? <ClassParamsSettings classId={classId} showOnly="survival" /> : null}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rules" className="flex-1 overflow-hidden m-0">
            {classId ? <RuleManagement classId={classId} /> : null}
          </TabsContent>

          <TabsContent value="growth" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              {classId ? <GrowthSettings classId={classId} /> : null}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="data" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              {classId ? <DataManagement classId={classId} /> : null}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="agreement" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              <UserAgreementSection />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="help" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              <HelpSection />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="about" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full px-1">
              <AboutSection />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
