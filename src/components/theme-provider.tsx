"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

function ThemeColorMetaSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const color = resolvedTheme === "light" ? "#f2f2f7" : "#000000";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorMetaSync />
      {children}
      <Toaster />
    </NextThemesProvider>
  );
}
