import { AppShell } from "@/components/app-shell/app-shell";
import { TodayView } from "@/features/planning/today-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "BrokeNoMore — ថ្ងៃនេះ" : "BrokeNoMore — Today",
  };
}

export default async function TodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AppShell title="Today" locale={locale}>
      <TodayView locale={locale} />
    </AppShell>
  );
}
