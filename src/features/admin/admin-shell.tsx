"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Users,
  Layers,
  MessageSquare,
  Trophy,
  Megaphone,
  Flag,
  FileText,
  Activity,
  Shield,
  ArrowLeft,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
  locale: string;
}

export function AdminShell({ children, locale }: AdminShellProps) {
  const pathname = usePathname();

  const navItems = [
    { to: `/${locale}/admin`, label: "Attention Queue", icon: AlertCircle },
    { to: `/${locale}/admin/users`, label: "Users & Support", icon: Users },
    { to: `/${locale}/admin/strategies`, label: "Strategies", icon: Layers },
    { to: `/${locale}/admin/coach`, label: "Coach Content", icon: MessageSquare },
    { to: `/${locale}/admin/leaderboard`, label: "Moderation", icon: Trophy },
    { to: `/${locale}/admin/campaigns`, label: "Campaigns", icon: Megaphone },
    { to: `/${locale}/admin/flags`, label: "Feature Flags", icon: Flag },
    { to: `/${locale}/admin/audit`, label: "Audit Log", icon: FileText },
    { to: `/${locale}/admin/system`, label: "System Health", icon: Activity },
    { to: `/${locale}/admin/staff`, label: "Staff & RBAC", icon: Shield },
  ];

  const isActive = (to: string) => {
    if (to === `/${locale}/admin`) return pathname === to;
    return pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar p-4 hidden md:flex md:flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Console</span>
              <h2 className="text-lg font-bold tracking-tight">SaveLuy Admin</h2>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Admin Navigation">
            {navItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "bg-sidebar-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-border px-2">
          <Link
            href={`/${locale}/today`}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Admin Region */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="md:hidden">
              <Link href={`/${locale}/today`} className="text-xs text-muted-foreground hover:underline">
                ← App
              </Link>
            </span>
            <h1 className="text-base font-bold">Admin Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Staff Verified
            </span>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
