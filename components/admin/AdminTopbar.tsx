"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Menu, Bell, Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  userName: string;
  userEmail: string;
  onToggleMobileSidebar?: () => void;
}

export default function AdminTopbar({ userName, userEmail, onToggleMobileSidebar }: Props) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30 sticky top-0 shadow-sm">
      {/* Left: Mobile Hamburger & Welcome message */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle (< lg) */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Logged in as{" "}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900">{userName}</span>
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* New Story Quick Button */}
        <Link
          href="/admin/stories/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Story</span>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            aria-expanded={showMenu}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center text-white text-xs font-black">
              {userName ? userName[0].toUpperCase() : "A"}
            </div>
            <span className="hidden md:block font-bold text-slate-800">{userName}</span>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-20 py-2 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900">{userName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>{loading ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
