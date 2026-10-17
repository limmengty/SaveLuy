import { AppShell } from "@/components/app-shell/app-shell";
import { WaitListView } from "@/features/planning/wait-list-view";

export default async function WaitListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <WaitListView />;
}
