"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, KeyRound, UserCircle, ImagePlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsDialog({ open, onOpenChange }: AccountSettingsDialogProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [lockSettings, setLockSettings] = useState(false);
  const [lockScoring, setLockScoring] = useState(false);
  const [hasPinCode, setHasPinCode] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (open && session?.user?.email) {
      fetchSettings();
      setName(session.user.name || "");
      setAvatar(session.user.image || "");
    }
  }, [open, session]);

  const fetchSettings = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/auth/settings");
      if (res.ok) {
        const data = await res.json();
        setLockSettings(data.lockSettings || false);
        setLockScoring(data.lockScoring || false);
        setHasPinCode(data.hasPinCode || false);
        if (data.name) setName(data.name);
        if (data.avatar) setAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch account settings", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if ((lockSettings || lockScoring) && !pinCode && !hasPinCode) {
      toast.error("首次开启安全锁功能需要设置 PIN 码");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pinCode: pinCode || undefined,
          lockSettings,
          lockScoring,
          name,
          avatar,
        }),
      });

      if (!res.ok) throw new Error("保存失败");
      
      // Update the NextAuth session so the UI reflects the new name/avatar immediately
      try {
        await update({ name, image: avatar });
      } catch (updateError) {
        console.warn("Failed to update NextAuth session on the client:", updateError);
        // We still consider the save successful since the DB was updated
      }
      
      toast.success("账户设置已保存");
      setPinCode(""); // Clear pin input
      onOpenChange(false);
    } catch (error) {
      toast.error("保存设置时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-slate-700" />
            账户与安全设置
          </DialogTitle>
          <DialogDescription>
            管理您的个人资料和班级操作的安全锁。
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full mt-2 flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">个人资料</TabsTrigger>
              <TabsTrigger value="security">安全锁</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="userName">称呼</Label>
                <Input 
                  id="userName" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：张老师"
                />
              </div>
              <div className="space-y-2">
                <Label>个人头像</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-2 border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden text-2xl relative group">
                    {avatar ? (
                      avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:') ? (
                        <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span>{avatar}</span>
                      )
                    ) : (
                      <UserCircle className="h-8 w-8 text-slate-300" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <ImagePlus className="h-5 w-5 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("图片大小不能超过 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <Input 
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="输入 Emoji (如 👨‍🏫) 或上传图片"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">点击左侧圆形区域可上传本地图片。</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">锁定参数设置与规则</Label>
                    <p className="text-sm text-muted-foreground">开启后，进入设置面板需要输入 PIN 码</p>
                  </div>
                  <Switch 
                    checked={lockSettings}
                    onCheckedChange={setLockSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">锁定加减分操作</Label>
                    <p className="text-sm text-muted-foreground">开启后，给学生加减分需要输入 PIN 码</p>
                  </div>
                  <Switch 
                    checked={lockScoring}
                    onCheckedChange={setLockScoring}
                  />
                </div>
              </div>

              {(lockSettings || lockScoring) && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="pinCode">设置/重置 PIN 码 (4-6位数字)</Label>
                  <Input 
                    id="pinCode" 
                    type="password" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="输入新的 PIN 码"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <p className="text-xs text-amber-600">如果之前已经设置过且不想修改，请留空。</p>
                </div>
              )}
            </TabsContent>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-amber-500 hover:bg-amber-600">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                保存设置
              </Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
