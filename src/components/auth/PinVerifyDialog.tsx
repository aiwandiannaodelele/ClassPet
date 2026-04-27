"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

interface PinVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinVerifyDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  title = "安全验证",
  description = "此操作已被锁定，请输入老师的 PIN 码以继续"
}: PinVerifyDialogProps) {
  const [pinCode, setPinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinCode }),
      });

      if (!res.ok) {
        throw new Error("PIN 码错误");
      }
      
      setPinCode("");
      onOpenChange(false);
      // Wait for the Dialog closing animation to finish before triggering success
      // to prevent Dialog backdrop blur bugs in Radix UI
      setTimeout(() => {
        onSuccess();
      }, 300);
    } catch (error: any) {
      toast.error(error.message || "验证失败");
      setPinCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[325px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input 
              type="password" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="输入 PIN 码"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
            />
          </div>

          <Button type="submit" disabled={isLoading || pinCode.length < 4} className="w-full bg-primary hover:bg-primary">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            确认解锁
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
