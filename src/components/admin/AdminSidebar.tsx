"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, LayoutDashboard, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          管理系统
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin"}>
              <Link href="/admin">
                <LayoutDashboard className="w-4 h-4" />
                仪表盘
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname?.startsWith("/admin/users")}>
              <Link href="/admin/users">
                <Users className="w-4 h-4" />
                用户管理
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname?.startsWith("/admin/classes")}>
              <Link href="/admin/classes">
                <BookOpen className="w-4 h-4" />
                班级管理
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname?.startsWith("/admin/settings")}>
              <Link href="/admin/settings">
                <Settings className="w-4 h-4" />
                管理系统
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回前台
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

