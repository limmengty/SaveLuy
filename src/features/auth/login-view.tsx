"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LedgerBrandMark } from "@/components/illustrations/ledger-lines";
import { 
  ShieldCheck, 
  Globe, 
  CalendarCheck,
  Lock,
  Wallet,
  CheckCircle2,
  TrendingDown
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

      {/* Hero section */}
      <main className="container mx-auto max-w-7xl px-6 flex-1 flex flex-col justify-center py-8 lg:py-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14">
          {/* Left Column: Bold, Minimal Typography */}
          <div className="w-full lg:max-w-xl text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              {t("headline")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("subheadline")}
            </p>

            {/* Google Continue CTA button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative flex h-12 items-center justify-center gap-3.5 rounded-full border border-border bg-card px-6 font-semibold text-[15px] text-foreground shadow-sm transition-all hover:bg-secondary hover:border-foreground/30 active:scale-[0.985] disabled:opacity-60 cursor-pointer"
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
            </div>

            {/* Privacy note without mentioning Supabase */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-muted-foreground/75 pt-2">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>{t("securityBadge")}</span>
            </div>
          </div>

          {/* Right Column: Realistic, High-Fidelity App Mockup Device */}
          <div className="relative w-full max-w-[620px] pb-6">
            {/* Ambient soft glow behind mockup */}
            <div 
              aria-hidden="true" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-primary/10 blur-[100px] pointer-events-none" 
            />

            {/* Main Desktop Dashboard Window */}
            <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-destructive/70" />
                  <div className="size-3 rounded-full bg-warning/70" />
                  <div className="size-3 rounded-full bg-primary/70" />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/70">brokenomore.app/today</div>
                <div className="size-3" />
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-5">
                {/* Available Today Hero Banner */}
                <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Available Today
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary border border-primary/30">
                      <CheckCircle2 className="size-3" />
                      On Plan
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-foreground tracking-tight">
                      $18.50
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">safe to spend today</span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-secondary/80 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: "24%" }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>$5.75 used today</span>
                      <span>5 days left in week</span>
                    </div>
                  </div>
                </div>

                {/* Vault Envelopes Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/25">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Wallet className="size-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">Flexible Weekly</span>
                    </div>
                    <div className="mt-2 font-mono text-base font-bold text-foreground">$92.50</div>
                    <div className="text-[10px] text-muted-foreground">Groceries & outings</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/25">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                        <Lock className="size-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">Protected Vault</span>
                    </div>
                    <div className="mt-2 font-mono text-base font-bold text-primary">$450.00</div>
                    <div className="text-[10px] text-muted-foreground">Rent, bills & savings</div>
                  </div>
                </div>

                {/* Instant Purchase Check Simulation Snippet */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/15 text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="size-4 text-warning" />
                    <span className="text-muted-foreground">Check: Lunch ($6.00)</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">
                    Next daily: <strong className="text-primary">$17.00</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Pacing Pill */}
            <div className="absolute -bottom-3 left-4 sm:left-8 flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-xl">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                <CalendarCheck className="size-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-foreground">Paced for 5 Days</div>
                <div className="text-[10px] font-mono text-muted-foreground">$18.50 each day guaranteed</div>
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
