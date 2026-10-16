import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/lib/i18n/routing";
import { Providers } from "@/lib/query/providers";
import { WealthEngineProvider } from "@/lib/wealth-engine/provider";
import { LocaleHtmlSync } from "@/components/locale-html-sync";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LocaleHtmlSync locale={locale} />
      <Providers>
        <WealthEngineProvider>{children}</WealthEngineProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}

