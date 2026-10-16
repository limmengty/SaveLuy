import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next"); 
  const safeNext = getSafeNextPath(rawNext, "/en-KH/today");

  // Determine true origin (respecting Vercel reverse proxy / x-forwarded headers)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/en-KH/login?reason=missing_code`, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/en-KH/login?reason=callback_failed`, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Check if profile exists and onboarding is complete
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    let profile: Record<string, unknown> | null = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = data as Record<string, unknown> | null;
    } catch {
      // Ignore if table/columns don't exist
    }

    // If profile row doesn't exist yet, insert it with avatar
    if (!profile) {
      try {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            display_name: displayName,
            avatar_url: avatarUrl,
            locale: "en-KH",
          })
          .select("*")
          .maybeSingle();
        profile = newProfile as Record<string, unknown> | null;
      } catch {
        // Table or RLS fallback
      }
    } else if (avatarUrl && !profile.avatar_url) {
      // Sync Google avatar if profile had none
      try {
        await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            display_name: displayName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch {
        // Ignore
      }
    }

    // Check if user already has an active plan in the database
    let hasActivePlan = false;
    try {
      const { data: activePlan } = await supabase
        .from("plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (activePlan) hasActivePlan = true;
    } catch {
      // Ignore
    }

    const hasMetaCompleted = Boolean(user.user_metadata?.onboarding_completed_at);
    const hasProfileCompleted = Boolean(profile?.onboarding_completed_at);

    // If onboarding is NOT completed anywhere and no plan exists, route to onboarding
    if (!hasMetaCompleted && !hasProfileCompleted && !hasActivePlan) {
      return NextResponse.redirect(`${origin}/en-KH/onboarding/income`, {
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`, {
    headers: { "Cache-Control": "no-store" },
  });
}
