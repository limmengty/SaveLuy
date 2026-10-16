import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface AppGroupLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AppGroupLayout({
  children,
  params,
}: AppGroupLayoutProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, check their onboarding state
  if (user) {
    // 1. Check user metadata first (fastest, guaranteed, immune to Postgres schema cache)
    const metaCompleted = user.user_metadata?.onboarding_completed_at;
    if (metaCompleted) {
      return <>{children}</>;
    }

    // 2. Check if user has an active plan in database
    let hasPlan = false;
    try {
      const { data: activePlan } = await supabase
        .from("plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (activePlan) hasPlan = true;
    } catch {
      // Ignore if table/schema issue
    }

    // 3. Check profile row if column exists
    let profileCompleted = false;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (profile && (profile as Record<string, unknown>).onboarding_completed_at) {
        profileCompleted = true;
      }
    } catch {
      // Ignore if column does not exist
    }

    // Only redirect to onboarding if user has NEITHER completed onboarding NOR an active plan
    if (!hasPlan && !profileCompleted) {
      redirect(`/${locale}/onboarding/income`);
    }
  }

  return <>{children}</>;
}
