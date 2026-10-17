"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { toast } from "sonner";
import { useRef } from "react";
import Image from "next/image";
import { User, Shield, Globe, Languages, Coins, MessageSquare, LogOut, Sun, Moon, Laptop, Camera, Loader2, Calendar } from "lucide-react";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { createClient } from "@/lib/supabase/client";
import { supabaseApi } from "@/lib/api/supabase-service";
import { cn } from "@/lib/utils";
import { STORAGE_KEYS, removeAllStorageKeys } from "@/lib/storage/migrate-storage";

export function SettingsView() {
  const t = useTranslations("settings");
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { state, setVoice, setCurrency, setExchangeRate, resetAll, updatePlan } = useWealthEngine();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [customRateInput, setCustomRateInput] = useState<string>("");
  const [isEditingCustomRate, setIsEditingCustomRate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine current locale from pathname
  const currentLocale = pathname.startsWith("/km-KH") ? "km-KH" : "en-KH";

  useEffect(() => {
    async function loadAuth() {
      try {
        const user = await supabaseApi.getUser();
        if (user) {
          setUserEmail(user.email ?? null);
          setUserId(user.id);
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name;

          const profile = await supabaseApi.getProfile();
          const effectiveAvatar = profile?.avatar_url || metaAvatar || null;
          const effectiveName = profile?.display_name || metaName || null;

          if (effectiveAvatar) setAvatarUrl(effectiveAvatar);
          if (effectiveName) setDisplayName(effectiveName);

          // If profile in database doesn't have the avatar_url yet, sync it in the background
          if (profile && !profile.avatar_url && metaAvatar) {
            const supabase = createClient();
            supabase
              .from("profiles")
              .update({ avatar_url: metaAvatar, updated_at: new Date().toISOString() })
              .eq("id", user.id)
              .then(() => {});
          }
        }
      } catch {
        // Fall back to unauthenticated / guest
      } finally {
        setIsLoadingAuth(false);
      }
    }
    loadAuth();
  }, []);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(t("uploadingPhoto"));
    try {
      const publicUrl = await supabaseApi.uploadAvatar(file);
      setAvatarUrl(publicUrl);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatarUrl: publicUrl } }));
      }
      router.refresh();
      toast.success("Profile photo updated", { id: toastId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload photo";
      toast.error(message, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUserEmail(null);
      setUserId(null);
      if (typeof window !== "undefined") {
        removeAllStorageKeys([STORAGE_KEYS.STATE, STORAGE_KEYS.LEGACY_STATE]);
        sessionStorage.clear();
      }
      resetAll();
      toast.success("Signed out successfully");
      router.push(`/${currentLocale}/login`);
    } catch {
      toast.error("Failed to sign out");
    }
  };


  const handleCurrencyChange = async (currency: "USD" | "KHR") => {
    try {
      setCurrency(currency);
      toast.success(`Currency set to ${currency}`);
    } catch {
      toast.error("Failed to update currency preference");
    }
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      {/* Account & Identity Section */}
      <section aria-label="Account and identity">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <User className="size-4" /> {t("account")}
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          {isLoadingAuth ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-muted" />
                  <div className="h-3 w-24 rounded-md bg-muted" />
                </div>
                <div className="h-5 w-44 rounded-md bg-muted" />
                <div className="h-3 w-32 rounded-md bg-muted/60" />
              </div>
              <div className="h-9 w-28 rounded-xl bg-muted" />
            </div>
          ) : userEmail ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                {/* Avatar with upload overlay */}
                <div className="relative group shrink-0">
                  <div className="relative size-16 sm:size-18 rounded-full overflow-hidden border-2 border-border/80 bg-secondary/80 flex items-center justify-center shadow-sm">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName || userEmail}
                        width={72}
                        height={72}
                        className="size-full object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl font-bold text-foreground/80 uppercase">
                        {(displayName || userEmail)[0]}
                      </span>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="size-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleAvatarFileSelect}
                    disabled={isUploading}
                    aria-label={t("uploadPhoto")}
                  />

                  {/* Change photo button trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title={avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                    aria-label={avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                    className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="size-3.5" />
                  </button>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-2 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {displayName || t("signedInAs")}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 self-start sm:self-center shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                <LogOut className="size-4" />
                {t("signOut")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("signedInAs")}</p>
                <p className="text-sm font-semibold text-foreground">Authenticated User</p>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                <LogOut className="size-4" />
                {t("signOut")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Preferences Section: Language & Currency */}
      <section aria-label="Preferences">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Globe className="size-4" /> {t("preferences")}
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
          {/* Language Switcher */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">{t("language")}</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: "en-KH", label: "English", sub: "Cambodia (USD)" },
                { code: "km-KH", label: "ភាសាខ្មែរ", sub: "Khmer" },
              ].map((l) => (
                <Link
                  key={l.code}
                  href={pathname.replace(`/${currentLocale}`, `/${l.code}`)}
                  className={cn(
                    "flex flex-col justify-center rounded-xl border p-3.5 text-left transition-colors cursor-pointer min-h-[70px]",
                    currentLocale === l.code
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-secondary"
                  )}
                >
                  <span className="block text-sm font-semibold">{l.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{l.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">{t("currency")}</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: "USD", symbol: "$", label: "USD ($)", desc: "100 cents / 1 USD" },
                { code: "KHR", symbol: "៛", label: "KHR (៛)", desc: "1 riel / 1 KHR" },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code as "USD" | "KHR")}
                  className={cn(
                    "flex flex-col justify-center rounded-xl border p-3.5 text-left transition-colors cursor-pointer min-h-[70px]",
                    (state.preferences.currency || "USD") === c.code
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-secondary"
                  )}
                >
                  <span className="block text-sm font-semibold">{c.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-tight">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Khmer Riel Exchange Rate Configuration */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">៛</span>
                <label className="text-sm font-medium text-foreground">{t("exchangeRate")}</label>
              </div>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                1 USD = {(state.preferences.khrExchangeRate || 4000).toLocaleString()} ៛
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("exchangeRateDesc")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { rate: 4000, label: t("rateMarketStandard"), sub: t("rateMarketLabel") },
                { rate: 4100, label: t("rateBankStandard"), sub: t("rateBankLabel") },
              ].map((preset) => {
                const currentRate = state.preferences.khrExchangeRate || 4000;
                const isSelected = currentRate === preset.rate && !isEditingCustomRate;

                return (
                  <button
                    key={preset.rate}
                    type="button"
                    onClick={() => {
                      setIsEditingCustomRate(false);
                      setExchangeRate(preset.rate);
                      toast.success(t("exchangeRateUpdated", { rate: preset.rate.toLocaleString() }));
                    }}
                    className={cn(
                      "flex flex-col justify-center rounded-xl border p-3 text-left transition-colors cursor-pointer min-h-[64px]",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary"
                    )}
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">{preset.sub}</span>
                  </button>
                );
              })}

              {/* Custom rate button / input */}
              {isEditingCustomRate ? (
                <div className="flex flex-col justify-center rounded-xl border border-primary bg-primary/5 p-2 min-h-[64px]">
                  <span className="text-[10px] font-semibold text-primary mb-1">{t("customRate")} (៛ / $1)</span>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      step="10"
                      min="1000"
                      max="10000"
                      value={customRateInput}
                      onChange={(e) => setCustomRateInput(e.target.value)}
                      placeholder={t("customRatePlaceholder")}
                      className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseInt(customRateInput, 10);
                        if (!isNaN(parsed) && parsed >= 1000 && parsed <= 10000) {
                          setExchangeRate(parsed);
                          setIsEditingCustomRate(false);
                          toast.success(t("exchangeRateUpdated", { rate: parsed.toLocaleString() }));
                        } else {
                          toast.error("Please enter a valid rate between 1,000 and 10,000");
                        }
                      }}
                      className="text-[11px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-md hover:bg-primary/90 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomRateInput((state.preferences.khrExchangeRate || 4000).toString());
                    setIsEditingCustomRate(true);
                  }}
                  className={cn(
                    "flex flex-col justify-center rounded-xl border p-3 text-left transition-colors cursor-pointer min-h-[64px]",
                    (state.preferences.khrExchangeRate !== 4000 && state.preferences.khrExchangeRate !== 4100)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-secondary"
                  )}
                >
                  <span className="text-xs font-bold">
                    {(state.preferences.khrExchangeRate !== 4000 && state.preferences.khrExchangeRate !== 4100 && state.preferences.khrExchangeRate)
                      ? `${state.preferences.khrExchangeRate.toLocaleString()} ៛ / $1`
                      : t("customRate")}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {(state.preferences.khrExchangeRate !== 4000 && state.preferences.khrExchangeRate !== 4100)
                      ? "Custom user rate"
                      : "Set any rate"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Cycle Anchor Switcher */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">{t("cycleAnchor")}</label>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("cycleAnchorDesc")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { day: 1, label: t("monday"), desc: "Default" },
                { day: 5, label: t("friday"), desc: "Payday" },
                { day: 6, label: t("saturday"), desc: "Weekend" },
                { day: 0, label: t("sunday"), desc: "Rest Day" },
              ].map((item) => {
                const currentAnchor = typeof state.plan.cycleAnchorDay === "number" ? state.plan.cycleAnchorDay : 1;
                const isSelected = currentAnchor === item.day;
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => {
                      updatePlan({ cycleAnchorDay: item.day });
                      toast.success(`Pacing cycle anchored to ${item.label}`);
                    }}
                    className={cn(
                      "flex flex-col justify-center rounded-xl border p-3 text-left transition-colors cursor-pointer min-h-[64px]",
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-card hover:bg-secondary"
                    )}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Theme</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "dark", label: "Dark", icon: Moon, desc: "Obsidian" },
                { id: "light", label: "Light", icon: Sun, desc: "Paper" },
                { id: "system", label: "System", icon: Laptop, desc: "Auto" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = theme === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setTheme(m.id);
                      toast.success(`Theme switched to ${m.label}`);
                    }}
                    className={cn(
                      "flex flex-col justify-center rounded-xl border p-3.5 text-left transition-colors cursor-pointer min-h-[70px]",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold truncate">{m.label}</span>
                    </div>
                    <span className="mt-1 block text-xs text-muted-foreground truncate">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Voice & Tone preference */}
      <section aria-label="Advisor voice">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <MessageSquare className="size-4" /> {t("voice")}
        </h2>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("voiceDesc")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { id: "calm", label: t("calm"), desc: t("calmDesc") },
              { id: "straight", label: t("straight"), desc: t("straightDesc") },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVoice(v.id as "calm" | "straight");
                  toast.success(`Voice set to ${v.label}`, {
                    id: "voice-change",
                  });
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors cursor-pointer",
                  state.preferences.voice === v.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                <span className="block text-sm font-semibold">{v.label}</span>
                <span className="text-xs text-muted-foreground">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Principles */}
      <section aria-label="Product principles">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Shield className="size-4" /> {t("principles")}
        </h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{t("p1Title")}</strong> {t("p1Desc")}
          </p>
          <p>
            <strong className="text-foreground">{t("p2Title")}</strong> {t("p2Desc")}
          </p>
          <p>
            <strong className="text-foreground">{t("p3Title")}</strong> {t("p3Desc")}
          </p>
        </div>
      </section>

      {/* Reset & Data */}
      <section aria-label="Data management">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Local Cache & Sync</h2>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Clear offline cached records and reload live transactions directly from your remote Supabase database.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  removeAllStorageKeys([STORAGE_KEYS.STATE, STORAGE_KEYS.LEGACY_STATE]);
                  sessionStorage.clear();
                  window.location.reload();
                }
                toast.success("Cache cleared. Reloading from database...");
              }}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary cursor-pointer"
            >
              Clear local cache & refresh
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
