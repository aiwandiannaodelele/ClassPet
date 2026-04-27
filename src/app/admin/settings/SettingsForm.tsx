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
    enableTurnstile: initialSettings.enableTurnstile || false,
    turnstileSiteKey: initialSettings.turnstileSiteKey || "",
    turnstileSecretKey: initialSettings.turnstileSecretKey || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("系统设置已更新");
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
        {/* Email Verification */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">邮箱验证码 (注册)</Label>
            <p className="text-sm text-muted-foreground">开启后，新用户注册必须验证邮箱可用性 (需配置 SMTP)</p>
          </div>
          <Switch
            checked={settings.enableEmailVerify}
            onCheckedChange={(val) => setSettings({ ...settings, enableEmailVerify: val })}
          />
        </div>

        {/* Turnstile */}
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
