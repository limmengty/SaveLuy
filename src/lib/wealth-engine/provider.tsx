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

const STORAGE_KEY = "brokenomore.state.v2";

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
  allocateFuture: (cents: number) => void;
  editTransaction: (id: string, updates: { label?: string; envelope?: "essentials" | "fun" }) => void;
  unlockEmergencyMoney: (amountCents: number, reason: string) => Promise<void>;
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

      // If not authenticated or error, initialize clean empty seed
      setState(seedState());
      setNow(new Date());
      setIsReady(true);
    }

    loadData();

    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync active global currency
  useEffect(() => {
    setActiveCurrency(state.preferences.currency || "USD");
  }, [state.preferences.currency]);

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

  // Edit transaction (US-012)
  const editTransaction = useCallback((id: string, updates: { label?: string; envelope?: "essentials" | "fun" }) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

    supabaseApi.updateTransaction(id, updates).catch(() => {});
  }, []);

  // Emergency money unlock (US-015)
  const unlockEmergencyMoney = useCallback(async (amountCents: number, reason: string) => {
    // Deduct from homeFixedMonthly or futureFundMonthly, and credit essentials
    setState((prev) => {
      const updatedPlan: Plan = {
        ...prev.plan,
        homeFixedMonthly: Math.max(0, prev.plan.homeFixedMonthly - amountCents),
        essentialsLimit: prev.plan.essentialsLimit + amountCents,
      };
      supabaseApi.savePlan(updatedPlan).catch(() => {});
      return {
        ...prev,
        plan: updatedPlan,
      };
    });

    // Record audit event in Supabase
    await supabaseApi.recordAuditEvent("emergency_unlock", {
      amountCents,
      reason,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const resetAll = useCallback(() => {
    const fresh = seedState();
    setState(fresh);
    setNow(new Date());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
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
        allocateFuture,
        editTransaction,
        unlockEmergencyMoney,
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
