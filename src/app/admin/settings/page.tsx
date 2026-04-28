import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findUnique({
    where: { id: "global" }
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">系统安全设置</h1>
      <p className="text-muted-foreground">管理全站的注册和登录安全策略。</p>
      
      <SettingsForm initialSettings={settings || {}} />
    </div>
  );
}
