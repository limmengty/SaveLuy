import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const safeNext = getSafeNextPath(rawNext, "/en-KH/today");

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

    let { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    // If profile row doesn't exist yet, insert it with avatar
    if (!profile) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          avatar_url: avatarUrl,
          locale: "en-KH",
        })
        .select("onboarding_completed_at, avatar_url")
        .maybeSingle();
      profile = newProfile;
    } else if (avatarUrl && !profile.avatar_url) {
      // Sync Google avatar if profile had none
      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }


    // Check if user already has an active plan in the database
    const { data: activePlan } = await supabase
      .from("plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    // If onboarding is NOT completed and no plan exists, route to onboarding
    if (!profile?.onboarding_completed_at && !activePlan) {
      return NextResponse.redirect(`${origin}/en-KH/onboarding/income`, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // If active plan exists but onboarding_completed_at was NULL, sync it
    if (activePlan && !profile?.onboarding_completed_at) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`, {
    headers: { "Cache-Control": "no-store" },
  });
}
