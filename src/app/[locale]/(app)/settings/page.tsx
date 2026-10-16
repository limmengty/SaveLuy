import { AppShell } from "@/components/app-shell/app-shell";
import { SettingsView } from "@/features/settings/settings-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "BrokeNoMore — ការកំណត់" : "BrokeNoMore — Settings",
  };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AppShell title="Profile & settings" locale={locale}>
      <SettingsView />
    </AppShell>
  );
}
