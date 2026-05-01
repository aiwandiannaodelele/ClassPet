"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDevResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");

      toast.success("如果该邮箱存在，将收到重置密码指引");
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    } catch (error: any) {
      if (typeof error?.message === "string" && error.message.includes("功能未开启")) {
        router.replace("/login");
        return;
      }
      toast.error(error.message || "请求失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">找回密码</CardTitle>
          <CardDescription>输入注册邮箱，获取重置密码指引</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {devResetUrl && (
              <div className="rounded-md border bg-white p-3 text-sm break-all">
                <div className="text-xs text-muted-foreground mb-1">开发模式重置链接</div>
                <Link href={devResetUrl} className="text-primary hover:underline">
                  {devResetUrl}
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              发送重置指引
            </Button>
            <div className="text-center text-sm text-slate-500">
              想起密码了？{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                返回登录
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
