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
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    // Check if user has an active plan in database
    const { data: activePlan } = await supabase
      .from("plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    // Only redirect to onboarding if user has NEITHER completed onboarding NOR an active plan
    if (!profile?.onboarding_completed_at && !activePlan) {
      redirect(`/${locale}/onboarding/income`);
    }
  }

  return <>{children}</>;
}
