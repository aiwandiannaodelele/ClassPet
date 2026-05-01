"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type SetupStatus = {
  needsSetup: boolean;
  hasAdmin: boolean;
  hasAnyUser: boolean;
  userCount: number;
};

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SetupStatus | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const mode = useMemo(() => {
    if (!status) return "unknown";
    return status.hasAnyUser ? "promote" : "create";
  }, [status]);

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      try {
        const setupRes = await fetch("/api/setup/status", { cache: "no-store" });

        if (!setupRes.ok) throw new Error("status");
        const setupData = (await setupRes.json()) as SetupStatus;

        if (canceled) return;

        setStatus(setupData);

        if (!setupData.needsSetup) {
          router.replace("/");
        }
      } catch {
        if (!canceled) toast.error("初始化状态获取失败");
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    run();
    return () => {
      canceled = true;
    };
  }, [router]);

  const createAdmin = async () => {
    if (!name.trim() || !email.trim() || !password) {
      toast.error("请填写完整信息");
      return;
    }
    if (password !== password2) {
      toast.error("两次密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "创建失败");
        return;
      }
      toast.success("管理员创建成功，请登录");
      router.replace("/login");
    } finally {
      setSubmitting(false);
    }
  };

  const promoteAdminByCredentials = async () => {
    if (!email.trim() || !password) {
      toast.error("请输入邮箱和密码");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup/promote-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "设置失败");
        return;
      }
      toast.success("已设置为超级管理员，请登录");
      router.replace("/login");
    } finally {
      setSubmitting(false);
    }
  };

  const promoteAdminBySession = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/setup/promote-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "session" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "设置失败");
        return;
      }
      toast.success("已设置为超级管理员");
      router.replace("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status.needsSetup) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/20 rounded-xl flex items-center justify-center shadow-sm border border-primary/30 overflow-hidden">
              <img src="/logo.png" alt="ClassPet Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">系统初始化</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "首次使用需要创建一个超级管理员账号"
              : `检测到已有用户（${status.userCount} 个），请指定一个账号为超级管理员`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">昵称</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="管理员" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">确认密码</Label>
                <Input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={submitting} onClick={createAdmin}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                创建超级管理员
              </Button>
            </>
          ) : (
            <>
              {sessionStatus === "authenticated" ? (
                <Button className="w-full" disabled={submitting} onClick={promoteAdminBySession}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  将当前账号设为超级管理员
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入已有账号邮箱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入该账号密码"
                    />
                  </div>

                  <Button className="w-full" disabled={submitting} onClick={promoteAdminByCredentials}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    设为超级管理员
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
