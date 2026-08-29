"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@storyflow.com");
    setPassword("Admin@12345");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Lighting Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-2xl story-ring-gradient p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            StoryFlow Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Sign in to create, manage, and publish visual Web Stories
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@storyflow.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs text-red-400 bg-red-950/50 border border-red-800/60 rounded-xl p-3"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In to Studio"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auto-fill Demo Admin Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            ← Back to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
