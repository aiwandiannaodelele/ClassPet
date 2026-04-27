import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { Users, BookOpen, Settings, LayoutDashboard, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            系统管理后台
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              仪表盘
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              用户管理
            </Button>
          </Link>
          <Link href="/admin/classes">
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              班级管理
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              系统设置
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回前台
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
