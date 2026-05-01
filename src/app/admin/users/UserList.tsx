"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function UserList({
  initialUsers,
  enablePasswordReset,
}: {
  initialUsers: any[];
  enablePasswordReset: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("角色更新成功");
    } catch (error) {
      toast.error("角色更新失败");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("确定要删除此用户吗？其关联的班级和数据都将被清空！")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter(u => u.id !== userId));
      toast.success("用户已删除");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail.trim() || !newPassword) {
      toast.error("邮箱和密码不能为空");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "创建失败");
        return;
      }

      setUsers([data.user, ...users]);
      setOpen(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNewRole("USER");
      toast.success("用户创建成功");
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "重置失败");
        return;
      }
      toast.success("已发送重置密码邮件");
    } catch {
      toast.error("重置失败");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>添加用户</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加用户</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="teacher@example.com" />
              </div>
              <div className="space-y-2">
                <Label>昵称</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="可选" />
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <Select value={newRole} onValueChange={(val) => setNewRole(val as any)}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="ADMIN">系统管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateUser} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>班级数</TableHead>
              <TableHead>角色权限</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || "未设置"}</TableCell>
                <TableCell>{user.email || "第三方登录"}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user._count.classes}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">普通用户</SelectItem>
                      <SelectItem value="ADMIN">系统管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {enablePasswordReset ? (
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                      重置密码
                    </Button>
                  ) : null}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无用户数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
