"use client";

import { useEffect } from "react";

export function LocaleHtmlSync({ locale }: { locale: string }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      if (document.body) {
        document.body.lang = locale;
      }
      if (locale.startsWith("km")) {
        document.documentElement.classList.add("font-khmer");
        document.body?.classList.add("font-khmer");
      } else {
        document.documentElement.classList.remove("font-khmer");
        document.body?.classList.remove("font-khmer");
      }
    }
  }, [locale]);

  return null;
}
