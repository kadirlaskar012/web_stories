"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Tag,
  Users,
  Image as ImageIcon,
  BarChart2,
  Search,
  Settings,
  Globe,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stories", label: "Stories Studio", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/seo", label: "SEO & Discover", icon: Search, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

interface Props {
  userRole: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ userRole, mobileOpen = false, onCloseMobile }: Props) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Fixed on Desktop, Slide-Over Drawer on Mobile) */}
      <aside
        className={cn(
          "admin-sidebar flex flex-col bg-slate-950 text-white z-50 transition-transform duration-300 ease-in-out",
          // Desktop behavior: fixed width, static position
          "lg:translate-x-0 lg:static lg:z-30 lg:w-64",
          // Mobile behavior: slide-over fixed drawer
          "fixed inset-y-0 left-0 w-72 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Admin navigation"
      >
        {/* Header / Brand */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-white font-bold text-lg group"
            onClick={onCloseMobile}
          >
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white leading-none block">StoryFlow</span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                Admin Studio
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar px-3 space-y-1" aria-label="Sidebar navigation">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group",
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />
                )}
              </Link>
            );
          })}

          {/* Public Site Link */}
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
              <span>View Public Site</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" aria-hidden="true" />
            </a>
          </div>
        </nav>

        {/* User Role Badge Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-bold">Role</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-black text-[10px] tracking-wider uppercase border border-slate-700">
            {userRole}
          </span>
        </div>
      </aside>
    </>
  );
}
