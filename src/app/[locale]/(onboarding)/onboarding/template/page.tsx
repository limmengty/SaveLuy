import { TemplateStep } from "@/features/onboarding/template-step";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TemplateStep locale={locale} />;
}
