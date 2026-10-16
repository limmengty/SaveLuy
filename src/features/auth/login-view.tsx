"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Globe 
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LedgerBrandMark } from "@/components/illustrations/ledger-lines";

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
    <div className="relative min-h-dvh flex flex-col justify-between overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glow & atmospheric depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 -z-10 h-[520px] w-[640px] rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 h-[300px] w-[500px] rounded-full bg-primary/5 blur-[100px]"
      />

      {/* Top Bar / Navigation */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href={`/${locale}/today`}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
        >
          <LedgerBrandMark size={32} className="transition-transform duration-200 group-hover:scale-105" />
          <span className="text-lg font-extrabold tracking-tight">
            Broke<span className="text-primary">No</span>More
          </span>
        </Link>

        {/* Language switch quick-toggle */}
        <Link
          href={`/${otherLocale}/login`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card/60 backdrop-blur-sm hover:bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          <Globe className="size-3.5 text-primary" />
          <span>{otherLocaleLabel}</span>
        </Link>
      </header>

      {/* Main Content Hero */}
      <main className="w-full max-w-[500px] mx-auto px-5 py-4 flex-1 flex flex-col justify-center">
        {/* Core Value Proposition Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
            <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
            <span>Daily Financial Clarity</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {t("headline")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t("subheadline")}
          </p>
        </div>

        {/* Interactive Sign-In Surface */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-7 shadow-lg shadow-black/10 space-y-6">
          {/* 3 Pillars of Financial Discipline */}
          <div className="space-y-3">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-secondary/35 border border-border/40 transition-colors hover:bg-secondary/50">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-foreground">{t("feature1Title")}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t("feature1Desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-secondary/35 border border-border/40 transition-colors hover:bg-secondary/50">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <TrendingUp className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-foreground">{t("feature2Title")}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t("feature2Desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-secondary/35 border border-border/40 transition-colors hover:bg-secondary/50">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Lock className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-foreground">{t("feature3Title")}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t("feature3Desc")}</p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 font-bold text-[15px] text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-200 hover:brightness-105 active:scale-[0.985] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <svg className="size-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t("googleSignIn")}</span>
                  <ArrowRight className="size-4 opacity-75 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-muted-foreground/80 font-medium">
              {t("googleSignInDesc")}
            </p>
          </div>

          {/* Guest / Direct Demo Mode Link */}
          <div className="pt-2 border-t border-border/40 text-center">
            <Link
              href={`/${locale}/today`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>{t("guestExplore")}</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Security & Integrity Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/75 text-center">
          <ShieldCheck className="size-3.5 shrink-0 text-primary" />
          <span>{t("securityBadge")}</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground/60 border-t border-border/20">
        <p>© {new Date().getFullYear()} BrokeNoMore · Built for intentional spending</p>
      </footer>
    </div>
  );
}
