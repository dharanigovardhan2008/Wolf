import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#eeeeef] text-[#111] md:flex-row">
      <AdminSidebar name={session.user.name ?? "Admin"} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}