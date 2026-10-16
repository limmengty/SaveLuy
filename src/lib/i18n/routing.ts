export const locales = ["en-KH", "km-KH"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-KH";
