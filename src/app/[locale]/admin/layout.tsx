import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/admin-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "km-KH" ? "BrokeNoMore — ផ្ទាំងគ្រប់គ្រង" : "BrokeNoMore — Admin Console",
  };
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminShell locale={locale}>{children}</AdminShell>;
}
