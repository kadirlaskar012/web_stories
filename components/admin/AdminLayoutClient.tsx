"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderOpen,
  Image as ImageIcon,
  BarChart2,
} from "lucide-react";

interface AdminLayoutClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  userName,
  userEmail,
  userRole,
  children,
}: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/stories", label: "Stories", icon: BookOpen },
    { href: "/admin/stories/new", label: "+ Story", icon: PlusCircle, isPrimary: true },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/media", label: "Media", icon: ImageIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      {/* Desktop & Mobile Drawer Sidebar */}
      <AdminSidebar
        userRole={userRole}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <AdminTopbar
          userName={userName}
          userEmail={userEmail}
          onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Admin Bottom Quick-Action Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-red-400 mt-1">New</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? "text-red-400 font-black" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
