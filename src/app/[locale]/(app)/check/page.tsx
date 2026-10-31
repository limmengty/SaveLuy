import { CheckView } from "@/features/purchase-check/check-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "SaveLuy — ពិនិត្យការចំណាយ" : "SaveLuy — Check Purchase",
  };
}

export default async function CheckPurchasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CheckView locale={locale} />;
}
