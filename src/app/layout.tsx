import type { ReactNode } from "react";
import { JetBrains_Mono, Kantumruy_Pro } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./style.css";

const fontKhmer = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-khmer",
  display: "swap",
});

const fontMonoData = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-data",
  display: "swap",
});

export const metadata = {
  title: "SaveLuy — Know what you can safely spend today.",
  description: "A calm daily spending decision system with instant capture and purchase impact checking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaveLuy",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Startup Image links for zero-white-screen PWA launch */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="/icon.svg"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="/icon.svg"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="/icon.svg"
        />
      </head>
      <body className={`${fontKhmer.variable} ${fontMonoData.variable} font-sans antialiased bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
