import { describe, expect, it, beforeEach } from "bun:test";
import {
  enqueueMutation,
  getOfflineQueue,
  dequeueMutation,
  clearOfflineQueue,
  replayOfflineQueue,
} from "./offline-queue";

describe("Offline Mutation Queue & Replay Engine", () => {
  beforeEach(() => {
    clearOfflineQueue();
  });

  it("enqueues and retrieves mutations idempotently", () => {
    const item1 = enqueueMutation("ADD_TRANSACTION", "mut-1", { amount: 350, envelope: "fun" });
    expect(item1.id).toBe("mut-1");

    const queue = getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe("ADD_TRANSACTION");

    // Idempotent check: duplicate mutation ID is ignored
    enqueueMutation("ADD_TRANSACTION", "mut-1", { amount: 350 });
    expect(getOfflineQueue().length).toBe(1);
  });

  it("dequeues specific completed mutations", () => {
    enqueueMutation("ADD_TRANSACTION", "mut-1", { amount: 350 });
    enqueueMutation("ADD_TRANSACTION", "mut-2", { amount: 500 });
    expect(getOfflineQueue().length).toBe(2);

    dequeueMutation("mut-1");
    const queue = getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe("mut-2");
  });

  it("replays queue with custom executor function", async () => {
    enqueueMutation("ADD_TRANSACTION", "mut-1", { amount: 150 });
    enqueueMutation("ADD_TRANSACTION", "mut-2", { amount: 250 });

    const executedIds: string[] = [];
    const result = await replayOfflineQueue(async (mut) => {
      executedIds.push(mut.id);
      return true; // success
    });

    expect(result.processed).toBe(2);
    expect(result.remaining).toBe(0);
    expect(executedIds).toEqual(["mut-1", "mut-2"]);
    expect(getOfflineQueue().length).toBe(0);
  });
});
