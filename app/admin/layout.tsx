import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ToastContainer } from "@/components/ui/Toast";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userRole={session.role} />
      <div className="flex-1 flex flex-col admin-content">
        <AdminTopbar userName={session.name} userEmail={session.email} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
