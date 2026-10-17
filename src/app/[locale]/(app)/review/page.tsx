import { AppShell } from "@/components/app-shell/app-shell";
import { ReviewView } from "@/features/review/review-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — ពិនិត្យប្រចាំសប្តាហ៍" : "SaveLuy — Weekly Review",
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ReviewView />;
}
