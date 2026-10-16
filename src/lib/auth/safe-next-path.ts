export function getSafeNextPath(rawNext: string | null | undefined, fallback: string = "/en-KH/today"): string {
  if (!rawNext) return fallback;

  // Disallow absolute external URLs, protocol-relative, javascript:, data:
  if (
    rawNext.startsWith("http://") ||
    rawNext.startsWith("https://") ||
    rawNext.startsWith("//") ||
    rawNext.startsWith("javascript:") ||
    rawNext.startsWith("data:")
  ) {
    return fallback;
  }

  // Must begin with single forward slash
  if (!rawNext.startsWith("/")) {
    return fallback;
  }

  // Clean path
  return rawNext;
}
