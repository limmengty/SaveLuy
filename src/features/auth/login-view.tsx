"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LedgerBrandMark } from "@/components/illustrations/ledger-lines";
import { 
  ShieldCheck, 
  ArrowUpRight, 
  Globe, 
  Calendar,
  Lock,
  Wallet
} from "lucide-react";

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
    <div className="relative min-h-svh bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top minimal navbar */}
      <header className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link 
          href={`/${locale}/today`} 
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
        >
          <LedgerBrandMark size={28} className="transition-transform group-hover:scale-105" />
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

          <a
            href="https://github.com/limmengty/BrokeNoMore"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="GitHub repository"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero section: Clean Balancify split layout */}
      <main className="container mx-auto max-w-7xl px-6 flex-1 flex flex-col justify-center py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column: Bold Typography & Direct Google Sign-In */}
          <div className="w-full lg:max-w-xl text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {t("headline")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("subheadline")}
            </p>

            {/* Google Continue CTA button (matching Balancify material style) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative flex h-12 items-center justify-center gap-3 rounded-full border border-border bg-card px-6 font-semibold text-sm text-foreground shadow-sm transition-all hover:bg-secondary hover:border-foreground/30 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                ) : (
                  <>
                    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
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
                    <span>{t("googleSignIn")}</span>
                  </>
                )}
              </button>

              <Link
                href={`/${locale}/today`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                <span>{t("guestExplore")}</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Trust disclaimer */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-muted-foreground/70 pt-2">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>{t("securityBadge")}</span>
            </div>
          </div>

          {/* Right Column: Clean App Preview Mockup */}
          <div className="relative w-full max-w-[620px] flex items-center justify-center lg:justify-end">
            {/* Ambient subtle backdrop bloom */}
            <div 
              aria-hidden="true" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" 
            />

            {/* Desktop / Tablet App Card Mockup */}
            <div className="relative w-full rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4">
              {/* Window Header dots */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-destructive/60" />
                  <div className="size-3 rounded-full bg-warning/60" />
                  <div className="size-3 rounded-full bg-primary/60" />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/60">BrokeNoMore Engine · Live</div>
              </div>

              {/* Today Hero Amount Card */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">Available Today</div>
                  <div className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-foreground">
                    $18.50 <span className="text-xs font-sans text-muted-foreground">/ day</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">On plan · Safe to spend today</div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center justify-center sm:justify-end gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    ● Paced 5 days left
                  </span>
                </div>
              </div>

              {/* Sample Envelopes list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Wallet className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Weekly Flexible</div>
                      <div className="text-[11px] text-muted-foreground">Groceries & Fun</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-foreground">$92.50</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-warning/10 text-warning">
                      <Lock className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Protected Vault</div>
                      <div className="text-[11px] text-muted-foreground">Rent & Bills</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-primary">$450.00</div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Mobile Preview Badge */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 hidden sm:flex items-center gap-3 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-3.5 shadow-xl">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
                <Calendar className="size-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Next 5 Days Paced</div>
                <div className="text-[11px] font-mono text-muted-foreground">$18.50 each day locked</div>
              </div>
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
