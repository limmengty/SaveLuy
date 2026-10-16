import { ReviewStep } from "@/features/onboarding/review-step";

export default async function ReviewOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ReviewStep locale={locale} />;
}
