/**
 * Zero-Latency Offline-First Mutation Queue & Replay Engine for SaveLuy
 * 
 * Guarantees that when internet is unavailable (e.g. wet markets, basement shops,
 * cellular drops in Cambodia), transactions, wait list changes, and plan updates
 * are persisted locally and automatically replayed to Supabase upon reconnection.
 * 
 * Works with idempotent clientMutationIds to prevent duplicate records.
 */

export interface QueuedMutation {
  id: string; // clientMutationId
  type: "ADD_TRANSACTION" | "REVERSE_TRANSACTION" | "ADD_WAIT_ITEM" | "REMOVE_WAIT_ITEM";
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
}

const OFFLINE_QUEUE_KEY = "saveluy_offline_mutations_v1";

// In-memory fallback for SSR/tests when localStorage is unavailable
let inMemoryStore: string | null = null;

const globalStorage = globalThis as typeof globalThis & { localStorage?: Storage };

function getStorageItem(key: string): string | null {
  const storage = globalStorage.localStorage;
  if (!storage) return inMemoryStore;
  try {
    return storage.getItem(key);
  } catch {
    return inMemoryStore;
  }
}

function setStorageItem(key: string, value: string): void {
  inMemoryStore = value;
  const storage = globalStorage.localStorage;
  if (!storage) return;
  try {
    storage.setItem(key, value);
    if (typeof window !== "undefined") {
      const parsed: unknown = JSON.parse(value);
      window.dispatchEvent(
        new CustomEvent("saveluy-offline-sync", {
          detail: { count: Array.isArray(parsed) ? parsed.length : 0 },
        })
      );
    }
  } catch {
    // ignore write/dispatch failures
  }
}

function removeStorageItem(key: string): void {
  inMemoryStore = null;
  const storage = globalStorage.localStorage;
  if (!storage) return;
  try {
    storage.removeItem(key);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saveluy-offline-sync", { detail: { count: 0 } }));
    }
  } catch {
    // ignore
  }
}

export function getOfflineQueue(): QueuedMutation[] {
  try {
    const raw = getStorageItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedMutation[]): void {
  try {
    setStorageItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Safe storage write fallback
  }
}

export function enqueueMutation(
  type: QueuedMutation["type"],
  id: string,
  payload: Record<string, unknown>
): QueuedMutation {
  const current = getOfflineQueue();
  // Filter out duplicate mutation IDs
  const existing = current.find((m) => m.id === id);
  if (existing) return existing;

  const mutation: QueuedMutation = {
    id,
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  saveOfflineQueue([...current, mutation]);
  return mutation;
}

export function dequeueMutation(id: string): void {
  const current = getOfflineQueue();
  const filtered = current.filter((m) => m.id !== id);
  saveOfflineQueue(filtered);
}

export function clearOfflineQueue(): void {
  try {
    removeStorageItem(OFFLINE_QUEUE_KEY);
  } catch {
    // Safe clear fallback
  }
}

/**
 * Replays all pending mutations in the queue sequentially.
 */
export async function replayOfflineQueue(
  executor: (mutation: QueuedMutation) => Promise<boolean>
): Promise<{ processed: number; remaining: number }> {
  const isOnline = typeof navigator === "undefined" || navigator.onLine !== false;
  if (!isOnline) return { processed: 0, remaining: getOfflineQueue().length };

  const queue = getOfflineQueue();
  if (queue.length === 0) return { processed: 0, remaining: 0 };

  let processed = 0;
  const stillPending: QueuedMutation[] = [];

  for (const item of queue) {
    try {
      const success = await executor(item);
      if (success) {
        processed++;
      } else {
        stillPending.push({ ...item, attempts: item.attempts + 1 });
      }
    } catch {
      stillPending.push({ ...item, attempts: item.attempts + 1 });
    }
  }

  saveOfflineQueue(stillPending);
  return { processed, remaining: stillPending.length };
}
