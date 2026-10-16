import { AppShell } from "@/components/app-shell/app-shell";
import { PlanView } from "@/features/planning/plan-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "BrokeNoMore — ផែនការ" : "BrokeNoMore — Plan",
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AppShell title="Plan" locale={locale}>
      <PlanView locale={locale} />
    </AppShell>
  );
}
