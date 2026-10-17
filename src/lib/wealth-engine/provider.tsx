"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import {
  computeToday,
  type Transaction,
  type Plan,
} from "../wealth-engine/engine";
import type { QuickAction, WaitItem, UserPreferences } from "@/types/domain";
import { supabaseApi } from "@/lib/api/supabase-service";
import { setActiveCurrency } from "@/lib/money";
import { STORAGE_KEYS, getMigratedStorageItem, removeAllStorageKeys } from "@/lib/storage/migrate-storage";

const STORAGE_KEY = STORAGE_KEYS.STATE;

const defaultPlan: Plan = {
  essentialsLimit: 830,   // $8.30/wk (~$36/mo)
  funLimit: 550,          // $5.50/wk (~$24/mo)
  homeFixedMonthly: 10000,// $100.00/mo
  futureFundMonthly: 3000,// $30.00/mo
  monthlyFlexibleIncome: 20000, // $200.00/mo
  monthlyWorkHours: 160,
};

const defaultQuickActions: QuickAction[] = [
  { id: "q1", label: "Coffee", emoji: "☕", amount: 150, envelope: "fun" },
  { id: "q2", label: "Meal", emoji: "🍜", amount: 250, envelope: "essentials" },
  { id: "q3", label: "Transport", emoji: "🛺", amount: 300, envelope: "essentials" },
  { id: "q4", label: "Drink", emoji: "🧃", amount: 200, envelope: "fun" },
  { id: "q5", label: "Groceries", emoji: "🥬", amount: 500, envelope: "essentials" },
];

interface EngineState {
  plan: Plan;
  transactions: Transaction[];
  waitList: WaitItem[];
  quickActions: QuickAction[];
  preferences: UserPreferences;
  futureAllocated: number; // in cents
}

function seedState(): EngineState {
  return {
    plan: defaultPlan,
    transactions: [],
    waitList: [],
    quickActions: defaultQuickActions,
    preferences: { voice: "calm", locale: "en-KH", currency: "USD" },
    futureAllocated: 0,
  };
}

interface WealthEngineContextValue {
  isReady: boolean;
  state: EngineState;
  now: Date;
  isAuthenticated: boolean;
  computed: ReturnType<typeof computeToday>;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Transaction;
  reverseTransaction: (id: string) => void;
  addWaitItem: (item: Omit<WaitItem, "id" | "unlockAt">) => void;
  removeWaitItem: (id: string) => void;
  updatePlan: (partial: Partial<Plan>) => void;
  setVoice: (voice: UserPreferences["voice"]) => void;
  setCurrency: (currency: UserPreferences["currency"]) => void;
  setExchangeRate: (rate: number) => void;
  allocateFuture: (cents: number) => void;
  submitWeeklyReview: (action: "future" | "carry" | "leave", remainderCents: number) => Promise<void>;
  reopenWeeklyReview: () => void;
  editTransaction: (id: string, updates: { label?: string; envelope?: "essentials" | "fun" }) => void;
  unlockEmergencyMoney: (amountCents: number, reason: string) => Promise<void>;
  revertEmergencyUnlock: (recordId: string) => Promise<void>;
  clearAllEmergencyRelief: () => Promise<void>;
  updateEmergencyReason: (recordId: string, newReason: string) => Promise<void>;
  resetAll: () => void;
  checkOpen: boolean;
  setCheckOpen: (open: boolean) => void;
}

const WealthEngineContext = createContext<WealthEngineContextValue | null>(null);

export function WealthEngineProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [state, setState] = useState<EngineState>(seedState);
  const [now, setNow] = useState<Date>(() => new Date());
  const [checkOpen, setCheckOpen] = useState(false);

  // Initialize: Load from Supabase DB for authenticated users
  useEffect(() => {
    async function loadData() {
      try {
        const user = await supabaseApi.getUser();
        if (user) {
          setIsAuthenticated(true);
          const cloudData = await supabaseApi.fetchUserData();
          if (cloudData) {
            setState(cloudData);
            setIsReady(true);
            setNow(new Date());
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load user data from Supabase:", err);
      }

      // If not authenticated or error, load saved local state or initialize clean seed
      const saved = getMigratedStorageItem(STORAGE_KEYS.STATE, STORAGE_KEYS.LEGACY_STATE);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(parsed);
          setNow(new Date());
          setIsReady(true);
          return;
        } catch {
          // Fall through to seedState
        }
      }

      setState(seedState());
      setNow(new Date());
      setIsReady(true);
    }

    loadData();

    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync active global currency and exchange rate
  useEffect(() => {
    setActiveCurrency(state.preferences.currency || "USD");
    if (state.preferences.khrExchangeRate) {
      import("@/lib/money").then((m) => m.setActiveExchangeRate(state.preferences.khrExchangeRate!));
    }
  }, [state.preferences.currency, state.preferences.khrExchangeRate]);

  // Sync to local storage
  useEffect(() => {
    if (isReady) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Safe storage write fallback
      }
    }
  }, [state, isReady]);

  // Transaction mutation with optimistic local update + Supabase sync
  const addTransaction = useCallback((tx: Omit<Transaction, "id" | "createdAt">) => {
    const clientMutationId = `mut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTx: Transaction = {
      ...tx,
      id: clientMutationId,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    setNow(new Date());

    // Asynchronously synchronize with Supabase backend
    supabaseApi.addTransaction({
      clientMutationId,
      amount: tx.amount,
      envelope: tx.envelope,
      label: tx.label,
    }).catch(() => {
      // Offline or error: mutation preserved in local storage
    });

    return newTx;
  }, []);

  // Reverse transaction
  const reverseTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, reversed: true } : t
      ),
    }));

    supabaseApi.reverseTransaction(id).catch(() => {});
  }, []);

  // Add wait item
  const addWaitItem = useCallback((item: Omit<WaitItem, "id" | "unlockAt">) => {
    const unlockAt = new Date(Date.now() + 86400000).toISOString();
    const newItem: WaitItem = {
      ...item,
      id: `wait-${Date.now()}`,
      unlockAt,
    };
    setState((prev) => ({
      ...prev,
      waitList: [newItem, ...prev.waitList],
    }));

    supabaseApi.addWaitItem({
      label: item.label,
      amount: item.amount,
      envelope: item.envelope,
      unlockAt,
    }).catch(() => {});
  }, []);

  // Remove wait item
  const removeWaitItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      waitList: prev.waitList.filter((w) => w.id !== id),
    }));

    supabaseApi.removeWaitItem(id).catch(() => {});
  }, []);

  // Update plan
  const updatePlan = useCallback((partial: Partial<Plan>) => {
    setState((prev) => {
      const updated = { ...prev.plan, ...partial };
      supabaseApi.savePlan(updated).catch(() => {});
      return {
        ...prev,
        plan: updated,
      };
    });
  }, []);

  // Voice preference
  const setVoice = useCallback((voice: UserPreferences["voice"]) => {
    setState((prev) => {
      const updated = { ...prev.preferences, voice };
      supabaseApi.updatePreferences(updated).catch(() => {});
      return {
        ...prev,
        preferences: updated,
      };
    });
  }, []);

  // Currency preference
  const setCurrency = useCallback((currency: UserPreferences["currency"]) => {
    setState((prev) => {
      const updated = { ...prev.preferences, currency };
      supabaseApi.updatePreferences(updated).catch(() => {});
      return {
        ...prev,
        preferences: updated,
      };
    });
  }, []);

  // Exchange rate preference
  const setExchangeRate = useCallback((rate: number) => {
    if (rate <= 0) return;
    import("@/lib/money").then((m) => m.setActiveExchangeRate(rate));
    setState((prev) => {
      const updated: UserPreferences = { ...prev.preferences, khrExchangeRate: rate };
      supabaseApi.updatePreferences(updated).catch(() => {});
      return {
        ...prev,
        preferences: updated,
      };
    });
  }, []);

  // Allocate future
  const allocateFuture = useCallback((cents: number) => {
    setState((prev) => ({
      ...prev,
      futureAllocated: prev.futureAllocated + cents,
    }));

    supabaseApi.saveWeeklyReview({
      planned: state.plan.essentialsLimit + state.plan.funLimit,
      spent: state.transactions.filter(t => !t.reversed).reduce((a, b) => a + b.amount, 0),
      remainder: cents,
      action: "future",
    }).catch(() => {});
  }, [state]);

  // Submit weekly review with persistence across page refresh
  const submitWeeklyReview = useCallback(async (action: "future" | "carry" | "leave", remainderCents: number) => {
    const now = new Date();
    const anchorDay = typeof state.plan.cycleAnchorDay === "number" ? state.plan.cycleAnchorDay : 1;
    const currentWeekStart = (await import("./engine")).weekStart(now, anchorDay).toISOString();

    setState((prev) => {
      const updatedPlan: Plan = {
        ...prev.plan,
        lastReviewedWeekStart: currentWeekStart,
        lastReviewAction: action,
      };

      const updatedFuture = action === "future" ? prev.futureAllocated + remainderCents : prev.futureAllocated;

      // Also persist plan with lastReviewedWeekStart
      supabaseApi.savePlan(updatedPlan).catch(() => {});

      return {
        ...prev,
        plan: updatedPlan,
        futureAllocated: updatedFuture,
      };
    });

    // Record review row in Supabase
    await supabaseApi.saveWeeklyReview({
      planned: state.plan.essentialsLimit + state.plan.funLimit,
      spent: state.transactions.filter((t) => !t.reversed).reduce((a, b) => a + b.amount, 0),
      remainder: remainderCents,
      action,
    }).catch(() => {});
  }, [state]);

  // Allow reopening / editing weekly review decision
  const reopenWeeklyReview = useCallback(() => {
    setState((prev) => {
      const updatedPlan: Plan = {
        ...prev.plan,
        lastReviewedWeekStart: undefined,
        lastReviewAction: undefined,
      };
      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });
  }, []);

  // Edit transaction (US-012)
  const editTransaction = useCallback((id: string, updates: { label?: string; envelope?: "essentials" | "fun" }) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

    supabaseApi.updateTransaction(id, updates).catch(() => {});
  }, []);

  // Emergency money unlock (US-015) - Decoupled One-Time Relief
  const unlockEmergencyMoney = useCallback(async (amountCents: number, reason: string) => {
    const timestamp = new Date().toISOString();

    // Deduct from protected commitments (homeFixed first, then futureFund)
    // and credit emergencyReliefCents for this cycle WITHOUT inflating recurring weekly baselines
    setState((prev) => {
      let remainingDeduction = amountCents;
      let newHomeFixed = prev.plan.homeFixedMonthly;
      let newFutureFund = prev.plan.futureFundMonthly;

      if (newHomeFixed >= remainingDeduction) {
        newHomeFixed -= remainingDeduction;
        remainingDeduction = 0;
      } else {
        remainingDeduction -= newHomeFixed;
        newHomeFixed = 0;
        newFutureFund = Math.max(0, newFutureFund - remainingDeduction);
      }

      const newRecord: import("../wealth-engine/engine").EmergencyUnlockRecord = {
        id: `emg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        amountCents,
        reason,
        createdAt: timestamp,
      };

      const existingHistory = prev.plan.emergencyHistory ?? [];

      const updatedPlan: Plan = {
        ...prev.plan,
        homeFixedMonthly: newHomeFixed,
        futureFundMonthly: newFutureFund,
        emergencyReliefCents: (prev.plan.emergencyReliefCents ?? 0) + amountCents,
        emergencyUnlockedTotalCents: (prev.plan.emergencyUnlockedTotalCents ?? 0) + amountCents,
        lastEmergencyReason: reason,
        lastEmergencyDate: timestamp,
        emergencyHistory: [newRecord, ...existingHistory],
      };

      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });

    // Record immutable audit event in Supabase
    await supabaseApi.recordAuditEvent("emergency_unlock", {
      amountCents,
      reason,
      timestamp,
    });
  }, []);

  // Revert emergency unlock and return funds to protected vault
  const revertEmergencyUnlock = useCallback(async (recordId: string) => {
    let revertedAmount = 0;
    const timestamp = new Date().toISOString();

    setState((prev) => {
      const history = prev.plan.emergencyHistory ?? [];
      let target = history.find((r) => r.id === recordId);

      // Fallback matching if there was no prior history array (legacy single-entry fallback)
      if (!target && (recordId === "active-latest" || history.length === 0)) {
        target = {
          id: recordId,
          amountCents: prev.plan.emergencyReliefCents ?? 0,
          reason: prev.plan.lastEmergencyReason || "Emergency access",
          createdAt: prev.plan.lastEmergencyDate || timestamp,
        };
      }

      if (!target || target.amountCents <= 0) return prev;

      revertedAmount = target.amountCents;
      const updatedHistory = history.filter((r) => r.id !== recordId);
      const remainingRelief = Math.max(0, (prev.plan.emergencyReliefCents ?? 0) - revertedAmount);
      const remainingTotalUnlocked = Math.max(0, (prev.plan.emergencyUnlockedTotalCents ?? 0) - revertedAmount);

      const latest = updatedHistory[0];

      // Restore to homeFixedMonthly without letting total protected exceed declared monthly income
      const maxProtectedAllowed = prev.plan.monthlyFlexibleIncome;
      const restoredHome = Math.min(
        Math.max(0, maxProtectedAllowed - prev.plan.futureFundMonthly),
        prev.plan.homeFixedMonthly + revertedAmount
      );

      const updatedPlan: Plan = {
        ...prev.plan,
        homeFixedMonthly: restoredHome,
        emergencyReliefCents: remainingRelief,
        emergencyUnlockedTotalCents: remainingTotalUnlocked,
        lastEmergencyReason: latest ? latest.reason : undefined,
        lastEmergencyDate: latest ? latest.createdAt : undefined,
        emergencyHistory: updatedHistory,
      };

      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });

    if (revertedAmount > 0) {
      await supabaseApi.recordAuditEvent("emergency_revert", {
        recordId,
        amountCents: revertedAmount,
        timestamp,
      });
    }
  }, []);

  // Clear all emergency unlocks and restore funds to protected vault
  const clearAllEmergencyRelief = useCallback(async () => {
    let restoredAmount = 0;
    const timestamp = new Date().toISOString();

    setState((prev) => {
      restoredAmount = prev.plan.emergencyReliefCents ?? 0;
      const updatedPlan: Plan = {
        ...prev.plan,
        homeFixedMonthly: prev.plan.homeFixedMonthly + restoredAmount,
        emergencyReliefCents: 0,
        emergencyUnlockedTotalCents: 0,
        lastEmergencyReason: undefined,
        lastEmergencyDate: undefined,
        emergencyHistory: [],
      };

      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });

    if (restoredAmount > 0) {
      await supabaseApi.recordAuditEvent("emergency_clear_all", {
        restoredAmountCents: restoredAmount,
        timestamp,
      });
    }
  }, []);

  // Edit reason of an emergency unlock
  const updateEmergencyReason = useCallback(async (recordId: string, newReason: string) => {
    setState((prev) => {
      const history = prev.plan.emergencyHistory ?? [];
      const updatedHistory = history.map((r) => (r.id === recordId ? { ...r, reason: newReason } : r));
      const latest = updatedHistory[0];

      const updatedPlan: Plan = {
        ...prev.plan,
        lastEmergencyReason: latest ? latest.reason : prev.plan.lastEmergencyReason,
        emergencyHistory: updatedHistory,
      };

      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });

    await supabaseApi.recordAuditEvent("emergency_edit_reason", {
      recordId,
      newReason,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const resetAll = useCallback(() => {
    const fresh = seedState();
    setState(fresh);
    setNow(new Date());
    removeAllStorageKeys([STORAGE_KEYS.STATE, STORAGE_KEYS.LEGACY_STATE]);
  }, []);

  const computed = useMemo(() => computeToday(state.plan, state.transactions, now), [
    state.plan,
    state.transactions,
    now,
  ]);

  return (
    <WealthEngineContext.Provider
      value={{
        isReady,
        state,
        now,
        isAuthenticated,
        computed,
        addTransaction,
        reverseTransaction,
        addWaitItem,
        removeWaitItem,
        updatePlan,
        setVoice,
        setCurrency,
        setExchangeRate,
        allocateFuture,
        submitWeeklyReview,
        reopenWeeklyReview,
        editTransaction,
        unlockEmergencyMoney,
        revertEmergencyUnlock,
        clearAllEmergencyRelief,
        updateEmergencyReason,
        resetAll,
        checkOpen,
        setCheckOpen,
      }}
    >
      {children}
    </WealthEngineContext.Provider>
  );
}

export function useWealthEngine() {
  const context = useContext(WealthEngineContext);
  if (!context) {
    throw new Error("useWealthEngine must be used within a WealthEngineProvider");
  }
  return context;
}
