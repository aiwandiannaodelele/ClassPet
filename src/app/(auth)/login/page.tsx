"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Github, Mail, ShieldAlert } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams?.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Settings state
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (errorMsg) {
      toast.error(errorMsg === "CredentialsSignin" ? "邮箱或密码错误，或需完成人机验证" : errorMsg);
    }
    
    fetch("/api/settings/global")
      .then((res) => res.json())
      .then((data) => setGlobalSettings(data))
      .catch(console.error);
  }, [errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (globalSettings?.enableTurnstile && !turnstileToken) {
      toast.error("请完成人机验证");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        turnstileToken,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("登录成功");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("登录时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    if (provider === 'github') setIsGithubLoading(true);
    if (provider === 'google') setIsGoogleLoading(true);
    
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      toast.error(`使用 ${provider} 登录失败`);
      if (provider === 'github') setIsGithubLoading(false);
      if (provider === 'google') setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm border border-amber-200 overflow-hidden">
            <img src="/logo.png" alt="ClassPet Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
        <CardDescription>登录萌宠班级屋后台管理</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleOAuthLogin('github')} 
            disabled={isGithubLoading || isGoogleLoading || isLoading}
          >
            {isGithubLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
            Github
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOAuthLogin('google')}
            disabled={isGithubLoading || isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2 text-red-500" />}
            Google
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">或者使用邮箱登录</span>
          </div>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>登录失败：{errorMsg === "CredentialsSignin" ? "密码错误" : errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
              <Link href="#" className="text-xs text-amber-600 hover:underline">忘记密码?</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {globalSettings?.enableTurnstile && globalSettings?.turnstileSiteKey && (
            <div className="flex justify-center my-2">
              <Turnstile 
                siteKey={globalSettings.turnstileSiteKey} 
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            登录
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm text-slate-500">
          还没有账号？{" "}
          <Link href="/register" className="text-amber-600 hover:underline font-medium">
            免费注册
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}