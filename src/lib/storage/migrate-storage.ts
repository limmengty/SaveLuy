/**
 * SaveLuy Storage Migration Utility
 * Ensures lossless backward compatibility from legacy BrokeNoMore keys to SaveLuy keys.
 */

export const STORAGE_KEYS = {
  STATE: "saveluy.state.v1",
  LEGACY_STATE: "brokenomore.state.v2",
  DRAFT_INCOME: "saveluy.draft.income",
  LEGACY_DRAFT_INCOME: "brokenomore.draft.income",
  DRAFT_TEMPLATE: "saveluy.draft.template",
  LEGACY_DRAFT_TEMPLATE: "brokenomore.draft.template",
} as const;

export function getMigratedStorageItem(primaryKey: string, legacyKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const primary = localStorage.getItem(primaryKey);
    if (primary !== null) return primary;

    const legacy = localStorage.getItem(legacyKey);
    if (legacy !== null) {
      // Migrate forward automatically
      localStorage.setItem(primaryKey, legacy);
      return legacy;
    }
  } catch {
    // Storage access safety
  }
  return null;
}

export function removeAllStorageKeys(keys: readonly string[]) {
  if (typeof window === "undefined") return;
  try {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage safety
  }
}
