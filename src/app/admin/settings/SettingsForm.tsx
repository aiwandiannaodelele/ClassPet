"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState({
    enableEmailVerify: initialSettings.enableEmailVerify || false,
    enablePasswordReset: initialSettings.enablePasswordReset || false,
    enableTurnstile: initialSettings.enableTurnstile || false,
    turnstileSiteKey: initialSettings.turnstileSiteKey || "",
    turnstileSecretKey: initialSettings.turnstileSecretKey || "",
    enableGithubOAuth: initialSettings.enableGithubOAuth || false,
    githubClientId: initialSettings.githubClientId || "",
    githubClientSecret: initialSettings.githubClientSecret || "",
    smtpHost: initialSettings.smtpHost || "",
    smtpPort: initialSettings.smtpPort?.toString?.() || "",
    smtpSecure: initialSettings.smtpSecure || false,
    smtpUser: initialSettings.smtpUser || "",
    smtpPass: initialSettings.smtpPass || "",
    smtpFrom: initialSettings.smtpFrom || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const smtpPortNum = settings.smtpPort ? Number(settings.smtpPort) : null;
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          smtpPort: smtpPortNum && Number.isFinite(smtpPortNum) ? smtpPortNum : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("管理系统已更新");
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>注册与登录安全</CardTitle>
        <CardDescription>
          配置 Cloudflare Turnstile 人机验证与邮箱验证码机制
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">邮箱验证码 (注册)</Label>
            <p className="text-sm text-muted-foreground">开启后，新用户注册需验证邮箱 (需配置 SMTP)</p>
          </div>
          <Switch
            checked={settings.enableEmailVerify}
            onCheckedChange={(val) => setSettings({ ...settings, enableEmailVerify: val })}
          />
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">找回/重置密码</Label>
            <p className="text-sm text-muted-foreground">关闭后，将隐藏“忘记密码”和后台重置入口</p>
          </div>
          <Switch
            checked={settings.enablePasswordReset}
            onCheckedChange={(val) => setSettings({ ...settings, enablePasswordReset: val })}
          />
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-1">
            <Label className="text-base">OAuth 第三方登录</Label>
            <p className="text-sm text-muted-foreground">开启后登录页显示第三方按钮（在管理系统中设置 OAuth 密钥）</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">启用 GitHub 登录</Label>
              <p className="text-sm text-muted-foreground">需要填写 GitHub OAuth 密钥</p>
            </div>
            <Switch
              checked={settings.enableGithubOAuth}
              onCheckedChange={(val) => setSettings({ ...settings, enableGithubOAuth: val })}
            />
          </div>
          {settings.enableGithubOAuth && (
            <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
              <div className="space-y-2">
                <Label>GitHub Client ID</Label>
                <Input
                  value={settings.githubClientId}
                  onChange={(e) => setSettings({ ...settings, githubClientId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub Client Secret</Label>
                <Input
                  type="password"
                  value={settings.githubClientSecret}
                  onChange={(e) => setSettings({ ...settings, githubClientSecret: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-1">
            <Label className="text-base">SMTP 配置</Label>
            <p className="text-sm text-muted-foreground">用于发送注册验证码、找回密码等邮件</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                placeholder="587"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">使用 TLS (secure)</Label>
              <p className="text-sm text-muted-foreground">常见：465 开启；587 关闭</p>
            </div>
            <Switch
              checked={settings.smtpSecure}
              onCheckedChange={(val) => setSettings({ ...settings, smtpSecure: val })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP 用户名</Label>
              <Input
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP 密码</Label>
              <Input
                type="password"
                value={settings.smtpPass}
                onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>发件人地址 (From)</Label>
            <Input
              value={settings.smtpFrom}
              onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
              placeholder="ClassPet <no-reply@example.com>"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cloudflare Turnstile (人机验证)</Label>
              <p className="text-sm text-muted-foreground">开启后，登录和注册页面将启用验证码</p>
            </div>
            <Switch
              checked={settings.enableTurnstile}
              onCheckedChange={(val) => setSettings({ ...settings, enableTurnstile: val })}
            />
          </div>

          {settings.enableTurnstile && (
            <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
              <div className="space-y-2">
                <Label>Site Key (前端密钥)</Label>
                <Input
                  value={settings.turnstileSiteKey}
                  onChange={(e) => setSettings({ ...settings, turnstileSiteKey: e.target.value })}
                  placeholder="0x4AAAAAA..."
                />
              </div>
              <div className="space-y-2">
                <Label>Secret Key (后端密钥)</Label>
                <Input
                  type="password"
                  value={settings.turnstileSecretKey}
                  onChange={(e) => setSettings({ ...settings, turnstileSecretKey: e.target.value })}
                  placeholder="0x4AAAAAA..."
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          保存设置
        </Button>
      </CardFooter>
    </Card>
  );
}
