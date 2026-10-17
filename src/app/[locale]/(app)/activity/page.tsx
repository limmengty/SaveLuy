import { AppShell } from "@/components/app-shell/app-shell";
import { ActivityView } from "@/features/transactions/activity-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — សកម្មភាព" : "SaveLuy — Activity",
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ActivityView />;
}
