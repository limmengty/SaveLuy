"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Calculator, CalendarCheck, Clock, Flame, Home, List, PieChart, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { supabaseApi } from "@/lib/api/supabase-service";
import { useTranslations } from "next-intl";
import { CheckPanel } from "@/features/purchase-check/check-panel";
import { SaveLuyLockup } from "@/components/brand/save-luy-lockup";
import { SaveLuyMark } from "@/components/brand/save-luy-mark";

interface AppShellProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  locale: string;
}

export function AppShell({ title, action, children, locale }: AppShellProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { setCheckOpen, now, isReady } = useWealthEngine();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAvatar() {
      try {
        const user = await supabaseApi.getUser();
        if (!user || !isMounted) return;
        const profile = await supabaseApi.getProfile();
        if (!isMounted) return;
        const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const effectiveAvatar = profile?.avatar_url || metaAvatar || null;
        if (effectiveAvatar) {
          setAvatarUrl(effectiveAvatar);
        }
      } catch {
        // Safe fallback
      }
    }
    loadAvatar();

    const handleAvatarUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl: string }>;
      if (customEvent.detail?.avatarUrl) {
        setAvatarUrl(customEvent.detail.avatarUrl);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("avatar-updated", handleAvatarUpdated);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("avatar-updated", handleAvatarUpdated);
      }
    };
  }, [pathname]);

  const main = [
    { to: `/${locale}/today`, label: t("today"), icon: Home },
    { to: `/${locale}/plan`, label: t("plan"), icon: PieChart },
    { to: `/${locale}/activity`, label: t("activity"), icon: List },
    { to: `/${locale}/progress`, label: t("progress"), icon: Flame },
  ] as const;

  const sub = [
    { to: `/${locale}/review`, label: t("review"), icon: CalendarCheck },
    { to: `/${locale}/plan/wait-list`, label: t("waitList"), icon: Clock },
  ] as const;

  const isActive = (to: string) => {
    if (to === `/${locale}/today`) return pathname === to || pathname === `/${locale}`;
    return pathname.startsWith(to);
  };

  const activeNavItem =
    [...main, ...sub, { to: `/${locale}/settings`, label: t("settings") }].find((item) =>
      isActive(item.to)
    );
  const displayTitle =
    title &&
    title !== "Today" &&
    title !== "Plan" &&
    title !== "Activity" &&
    title !== "Progress" &&
    title !== "Weekly review" &&
    title !== "Profile & settings" &&
    title !== "Wait list"
      ? title
      : (activeNavItem?.label || title || t("today"));

  const formattedDate = isReady
    ? now.toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar (Fixed left) */}
      <aside className="fixed inset-y-0 left-0 hidden w-[232px] flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex xl:w-[248px] z-30">
        <div className="px-2 pb-8">
          <Link href={`/${locale}/today`} className="flex items-center gap-2.5 group" aria-label="SaveLuy Home">
            <SaveLuyLockup markSize={28} wordmarkSize="md" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {main.slice(0, 2).map((item) => (
            <SideLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActive(item.to)}
            />
          ))}

          <button
            onClick={() => setCheckOpen(true)}
            className="my-2 flex h-11 items-center gap-3 rounded-xl bg-primary px-3 font-semibold text-primary-foreground transition-all hover:opacity-95 shadow-sm shadow-primary/20 cursor-pointer active:scale-[0.98]"
          >
            <Calculator className="size-5" />
            {t("checkPurchase")}
          </button>

          {main.slice(2).map((item) => (
            <SideLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActive(item.to)}
            />
          ))}

          {sub.map((item) => (
            <SideLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActive(item.to)}
              indent
            />
          ))}

          <div className="flex-1" />

          <Link
            href={`/${locale}/settings`}
            className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors hover:bg-sidebar-accent",
              isActive(`/${locale}/settings`)
                ? "bg-sidebar-accent font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {avatarUrl ? (
              <div className="relative size-6 shrink-0 rounded-full overflow-hidden border border-border">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              </div>
            ) : (
              <User className="size-5" />
            )}
            {t("settings")}
          </Link>
        </nav>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-h-0 lg:pl-[232px] xl:pl-[248px]">
        {/* Unified Top Contextual Header with safe-area-inset-top */}
        <header className="shrink-0 z-20 border-b border-border/80 header-solid safe-top">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-6 lg:h-16 lg:px-8">
            {/* Left: Brand mark on mobile + view title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href={`/${locale}/today`} className="lg:hidden shrink-0 flex items-center" aria-label="SaveLuy Home">
                <SaveLuyMark size={26} />
              </Link>
              <h1 className="truncate text-lg font-bold tracking-tight text-foreground lg:text-[24px]">
                {displayTitle}
              </h1>
            </div>

            {/* Right: Date pill + Context action + Profile trigger */}
            <div className="flex items-center gap-2.5">
              {formattedDate && (
                <span className="text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {formattedDate}
                </span>
              )}
              {action}
              <Link
                href={`/${locale}/settings`}
                aria-label="Profile & settings"
                className="relative grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden overflow-hidden"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <User className="size-4" />
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* ScrollRoot: The SINGLE Vertical Scroller */}
        <main
          id="app-scroll-root"
          className="flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8 safe-bottom-scroll focus:outline-none"
        >
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Restrained Bottom Dock */}
      <nav
        aria-label="Main Navigation"
        className="fixed inset-x-0 bottom-0 z-30 glass-dock safe-bottom lg:hidden shadow-lg shadow-black/5"
      >
        <div className="mx-auto grid h-14 max-w-xl grid-cols-5 items-center px-1">
          <TabLink {...main[0]} active={isActive(main[0].to)} />
          <TabLink {...main[1]} active={isActive(main[1].to) || isActive(`/${locale}/plan/wait-list`)} />

          <button
            onClick={() => setCheckOpen(true)}
            aria-label={t("check")}
            className="flex flex-col items-center justify-center -mt-3 text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 border-2 border-background">
              <Calculator className="size-5" />
            </span>
            <span className="text-[10px] font-bold text-foreground mt-0.5">{t("check")}</span>
          </button>

          <TabLink {...main[2]} active={isActive(main[2].to)} />
          <TabLink {...main[3]} active={isActive(main[3].to)} />
        </div>
      </nav>

      {/* Global Check Purchase Drawer */}
      <CheckPanel />
    </div>
  );
}

interface NavLinkProps {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  indent?: boolean;
}

function SideLink({ to, label, icon: Icon, active, indent }: NavLinkProps) {
  return (
    <Link
      href={to}
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors hover:bg-sidebar-accent",
        indent && "pl-6 text-sm",
        active
          ? "bg-sidebar-accent font-semibold text-foreground"
          : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" /> {label}
    </Link>
  );
}

function TabLink({ to, label, icon: Icon, active }: NavLinkProps) {
  return (
    <Link
      href={to}
      className={cn(
        "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
        active ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "grid h-6 w-10 place-items-center rounded-full transition-all",
          active && "bg-secondary text-primary"
        )}
      >
        <Icon className="size-4.5" strokeWidth={active ? 2.4 : 1.8} />
      </span>
      <span className="leading-none mt-0.5">{label}</span>
    </Link>
  );
}
