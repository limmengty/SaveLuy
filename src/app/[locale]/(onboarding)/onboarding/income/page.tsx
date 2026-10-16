import { IncomeStep } from "@/features/onboarding/income-step";

export default async function IncomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <IncomeStep locale={locale} />;
}
