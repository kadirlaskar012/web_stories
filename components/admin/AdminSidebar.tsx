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
  Image,
  BarChart2,
  Search,
  Settings,
  Globe,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/seo", label: "SEO", icon: Search, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

interface Props {
  userRole: string;
}

export default function AdminSidebar({ userRole }: Props) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="admin-sidebar flex flex-col" aria-label="Admin navigation">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-white font-bold text-lg"
          aria-label="Admin Dashboard"
        >
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-black">
            S
          </div>
          <span>StoryFlow</span>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5 ml-9">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Sidebar navigation">
        <ul role="list" className="space-y-0.5 px-3">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400"
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Public site link */}
        <div className="mt-4 px-3 pt-4 border-t border-gray-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors"
          >
            <Globe className="w-4 h-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
            View Site
            <ChevronRight className="w-3 h-3 ml-auto opacity-50" aria-hidden="true" />
          </a>
        </div>
      </nav>

      {/* Role indicator */}
      <div className="px-6 py-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          Role:{" "}
          <span className="text-gray-300 font-medium">{userRole}</span>
        </span>
      </div>
    </aside>
  );
}
