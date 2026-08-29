import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
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
    <>
      <AdminLayoutClient
        userName={session.name}
        userEmail={session.email}
        userRole={session.role}
      >
        {children}
      </AdminLayoutClient>
      <ToastContainer />
    </>
  );
}
