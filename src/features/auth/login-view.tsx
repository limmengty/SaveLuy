"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Lock, CheckCircle2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LedgerBrandMark } from "@/components/illustrations/ledger-lines";

export function LoginView() {
  const t = useTranslations("auth");
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

  return (
    <div className="relative flex min-h-[90dvh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Background ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-72 w-72 rounded-full bg-primary/10 blur-[96px]"
      />

      <div className="mx-auto w-full max-w-[420px] space-y-7">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3">
          <LedgerBrandMark size={56} className="transition-transform hover:scale-105" />
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Broke<span className="text-primary">No</span>More
            </h1>
            <p className="text-sm font-semibold text-foreground/90">
              {t("signInTitle")}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              {t("signInSubtitle")}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 text-left">
          <div className="space-y-2.5">
            {[
              {
                icon: CheckCircle2,
                title: "One dependable number",
                desc: "Your daily safe spend recomputes every morning.",
              },
              {
                icon: Calculator,
                title: "Check before you tap",
                desc: "Instant ripple-effect check before money leaves your pocket.",
              },
              {
                icon: Lock,
                title: "Protected vault",
                desc: "Rent, bills, and future savings stay safely locked away.",
              },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                <feature.icon className="size-4 shrink-0 text-primary mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.985] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <svg className="size-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>{t("googleSignIn")}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="size-4 text-primary" />
            <span>Encrypted cloud sync with Supabase RLS</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          {t("tagline")} · No ads · No debt commingling
        </p>
      </div>
    </div>
  );
}

