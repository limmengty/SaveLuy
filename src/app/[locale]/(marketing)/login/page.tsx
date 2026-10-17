import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginView } from "@/features/auth/login-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — ចូលគណនី" : "SaveLuy — Sign In",
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(`/${locale}/today`);
  }

  return <LoginView />;
}
