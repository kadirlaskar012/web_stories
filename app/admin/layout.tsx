import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ToastContainer } from "@/components/ui/Toast";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If on login page or not yet authenticated, render clean full-screen wrapper
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar userRole={session.role} />
      <div className="flex-1 flex flex-col admin-content min-w-0">
        <AdminTopbar userName={session.name} userEmail={session.email} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
