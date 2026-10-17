import { AppShell } from "@/components/app-shell/app-shell";
import { ProgressView } from "@/features/progress/progress-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — វឌ្ឍនភាព" : "SaveLuy — Progress",
  };
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ProgressView />;
}
