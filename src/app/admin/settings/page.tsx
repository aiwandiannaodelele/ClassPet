import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findUnique({
    where: { id: "global" }
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">管理系统</h1>
      <p className="text-muted-foreground">管理全站的登录、安全与邮件等配置。</p>
      
      <SettingsForm initialSettings={settings || {}} />
    </div>
  );
}
