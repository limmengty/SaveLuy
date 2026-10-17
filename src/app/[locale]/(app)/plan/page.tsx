import { AppShell } from "@/components/app-shell/app-shell";
import { PlanView } from "@/features/planning/plan-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — ផែនការ" : "SaveLuy — Plan",
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <PlanView locale={locale} />;
}
