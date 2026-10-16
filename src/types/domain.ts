import type { EnvelopeId } from "@/lib/wealth-engine/engine";

export interface WaitItem {
  id: string;
  label: string;
  amount: number; // integer cents
  envelope: EnvelopeId;
  unlockAt: string; // ISO
}

export interface QuickAction {
  id: string;
  label: string;
  emoji: string;
  amount: number; // integer cents
  envelope: EnvelopeId;
}

export interface UserPreferences {
  voice: "calm" | "straight";
  locale: "en-KH" | "km-KH";
  currency: "USD" | "KHR";
}

