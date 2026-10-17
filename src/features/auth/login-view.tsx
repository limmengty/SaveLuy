"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LedgerBrandMark, LedgerClarityHeroArt } from "@/components/illustrations/ledger-lines";
import { ShieldCheck, Globe } from "lucide-react";

export function LoginView() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    }
  };

  const otherLocale = locale === "km-KH" ? "en-KH" : "km-KH";
  const otherLocaleLabel = locale === "km-KH" ? "English" : "ភាសាខ្មែរ";

  return (
    <div className="relative min-h-svh bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Top minimal navbar */}
      <header className="container mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link 
          href={`/${locale}/today`} 
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
        >
          <LedgerBrandMark size={28} className="transition-transform duration-200 group-hover:scale-105" />
          <span>
            Broke<span className="text-primary">No</span>More
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/${otherLocale}/login`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Globe className="size-3.5 text-primary" />
            <span>{otherLocaleLabel}</span>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="container mx-auto max-w-7xl px-6 flex-1 flex flex-col justify-center py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
          {/* Left Column: Focused, High-Trust Login & Positioning */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-7">
            {/* Minimal Brand Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Prospective Daily Clarity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.06]">
              {t("headline")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("subheadline")}
            </p>

            {/* Elevated Google Continue CTA card */}
            <div className="pt-2 flex flex-col items-center lg:items-start gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative flex h-13 w-full sm:w-auto min-w-[260px] items-center justify-center gap-3.5 rounded-2xl border border-border/80 bg-card px-8 font-semibold text-[15px] text-foreground shadow-lg shadow-black/15 transition-all hover:bg-secondary hover:border-primary/40 active:scale-[0.985] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                ) : (
                  <>
                    <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="tracking-tight">{t("googleSignIn")}</span>
                  </>
                )}
              </button>

              {/* Privacy badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>{t("securityBadge")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bespoke Architectural Vector Art */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient subtle backdrop radiance */}
            <div 
              aria-hidden="true" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] h-[360px] rounded-full bg-primary/10 blur-[90px] pointer-events-none" 
            />

            <div className="relative w-full max-w-[500px]">
              <LedgerClarityHeroArt />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted-foreground/60 border-t border-border/20">
        <p>© {new Date().getFullYear()} BrokeNoMore · Clarity before you spend</p>
      </footer>
    </div>
  );
}
