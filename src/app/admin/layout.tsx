import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-slate-50">
        <AdminSidebar />
        <SidebarInset>
          <main className="h-screen overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
