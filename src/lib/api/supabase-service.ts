import { createClient } from "@/lib/supabase/client";
import type { Plan, Transaction, EnvelopeId } from "@/lib/wealth-engine/engine";
import type { QuickAction, WaitItem, UserPreferences } from "@/types/domain";

export interface SupabaseUserData {
  plan: Plan;
  transactions: Transaction[];
  quickActions: QuickAction[];
  waitList: WaitItem[];
  preferences: UserPreferences;
  futureAllocated: number;
}

export const supabaseApi = {
  // Check auth user
  async getUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Fetch full user profile (with avatar, display name, etc.)
  async getProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return profile;
  },

  // Upload avatar image to Supabase Storage and update profile
  async uploadAvatar(file: File): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // 1. Always update Supabase Auth user metadata first (this immediately persists across all sessions and reloads)
    try {
      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      });
    } catch (e) {
      console.warn("Failed to update auth metadata:", e);
    }

    // 2. Best-effort update to public.profiles table (if column exists)
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (profileError) {
        console.warn("Profiles table avatar_url sync skipped or failed:", profileError.message);
      }
    } catch (e) {
      console.warn("Failed to update profiles table:", e);
    }

    return publicUrl;
  },

  // Fetch all user financial data
  async fetchUserData(): Promise<SupabaseUserData | null> {

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch Plan
    const { data: planRow } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    // Fetch Preferences
    const { data: prefRow } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch Transactions
    const { data: txRows } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch Quick Actions
    const { data: qaRows } = await supabase
      .from("quick_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    // Fetch Wait Items
    const { data: waitRows } = await supabase
      .from("wait_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "waiting")
      .order("created_at", { ascending: false });

    // Fetch Future fund allocations and latest review from weekly reviews
    const { data: reviewRows } = await supabase
      .from("weekly_reviews")
      .select("remainder_cents, action, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const futureAllocated = (reviewRows || [])
      .filter((r) => r.action === "future")
      .reduce((acc, r) => acc + (r.remainder_cents || 0), 0);

    const latestReview = reviewRows && reviewRows.length > 0 ? reviewRows[0] : null;

    // Fetch active emergency unlocks for the current cycle
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - dow);
    const currentWeekStartIso = d.toISOString();

    const { data: emergencyRows } = await supabase
      .from("audit_events")
      .select("id, event_type, payload, created_at")
      .eq("user_id", user.id)
      .in("event_type", ["emergency_unlock", "emergency_revert", "emergency_clear_all"])
      .gte("created_at", currentWeekStartIso)
      .order("created_at", { ascending: true }); // chronological order

    let emergencyReliefCents = 0;
    let emergencyUnlockedTotalCents = 0;
    let lastEmergencyReason: string | undefined;
    let lastEmergencyDate: string | undefined;
    const emergencyHistory: import("../wealth-engine/engine").EmergencyUnlockRecord[] = [];

    if (emergencyRows && emergencyRows.length > 0) {
      for (const row of emergencyRows) {
        const payload = (row.payload || {}) as Record<string, unknown>;

        if (row.event_type === "emergency_clear_all") {
          // Clear all active emergency relief
          emergencyReliefCents = 0;
          emergencyUnlockedTotalCents = 0;
          lastEmergencyReason = undefined;
          lastEmergencyDate = undefined;
          emergencyHistory.length = 0;
        } else if (row.event_type === "emergency_revert") {
          // Remove reverted record from active relief
          const revertedRecordId = typeof payload.recordId === "string" ? payload.recordId : undefined;
          const revertedAmount = typeof payload.amountCents === "number" ? payload.amountCents : 0;
          emergencyReliefCents = Math.max(0, emergencyReliefCents - revertedAmount);
          emergencyUnlockedTotalCents = Math.max(0, emergencyUnlockedTotalCents - revertedAmount);

          if (revertedRecordId) {
            const idx = emergencyHistory.findIndex((r) => r.id === revertedRecordId);
            if (idx !== -1) emergencyHistory.splice(idx, 1);
          } else if (emergencyHistory.length > 0) {
            emergencyHistory.pop();
          }
        } else if (row.event_type === "emergency_unlock") {
          const amount = typeof payload.amountCents === "number" ? payload.amountCents : 0;
          const reason = typeof payload.reason === "string" ? payload.reason : "Emergency access";
          emergencyReliefCents += amount;
          emergencyUnlockedTotalCents += amount;
          lastEmergencyReason = reason;
          lastEmergencyDate = row.created_at;
          emergencyHistory.unshift({
            id: row.id ?? `emg-${row.created_at}`,
            amountCents: amount,
            reason,
            createdAt: row.created_at,
          });
        }
      }
    }

    const plan: Plan = planRow
      ? {
          essentialsLimit: planRow.essentials_limit_cents,
          funLimit: planRow.fun_limit_cents,
          homeFixedMonthly: planRow.home_fixed_monthly_cents,
          futureFundMonthly: planRow.future_fund_monthly_cents,
          monthlyFlexibleIncome: planRow.monthly_flexible_income_cents,
          monthlyWorkHours: planRow.monthly_work_hours,
          ...(latestReview && new Date(latestReview.created_at) >= new Date(currentWeekStartIso)
            ? {
                lastReviewedWeekStart: currentWeekStartIso,
                lastReviewAction: latestReview.action as "future" | "carry" | "leave",
              }
            : {}),
          ...(emergencyReliefCents > 0
            ? {
                emergencyReliefCents,
                emergencyUnlockedTotalCents,
                lastEmergencyReason,
                lastEmergencyDate,
                emergencyHistory,
              }
            : {}),
        }
      : {
          essentialsLimit: 830,
          funLimit: 550,
          homeFixedMonthly: 10000,
          futureFundMonthly: 3000,
          monthlyFlexibleIncome: 20000,
          monthlyWorkHours: 160,
          ...(latestReview && new Date(latestReview.created_at) >= new Date(currentWeekStartIso)
            ? {
                lastReviewedWeekStart: currentWeekStartIso,
                lastReviewAction: latestReview.action as "future" | "carry" | "leave",
              }
            : {}),
        };

    const preferences: UserPreferences = {
      voice: (prefRow?.voice as "calm" | "straight") || "calm",
      locale: (prefRow?.locale as "en-KH" | "km-KH") || "en-KH",
      currency: (prefRow?.currency as "USD" | "KHR") || "USD",
      khrExchangeRate: prefRow?.khr_exchange_rate || 4000,
    };

    const transactions: Transaction[] = (txRows || []).map((t) => ({
      id: t.id,
      amount: t.amount_cents,
      envelope: t.envelope as EnvelopeId,
      label: t.label,
      createdAt: t.created_at,
      reversed: t.reversed,
    }));

    const quickActions: QuickAction[] = (qaRows && qaRows.length > 0)
      ? qaRows.map((q) => ({
          id: q.id,
          label: q.label,
          emoji: q.emoji,
          amount: q.amount_cents,
          envelope: q.envelope as EnvelopeId,
        }))
      : [
          { id: "q1", label: "Coffee", emoji: "☕", amount: 150, envelope: "fun" },
          { id: "q2", label: "Meal", emoji: "🍜", amount: 250, envelope: "essentials" },
          { id: "q3", label: "Transport", emoji: "🛺", amount: 300, envelope: "essentials" },
          { id: "q4", label: "Drink", emoji: "🧃", amount: 200, envelope: "fun" },
          { id: "q5", label: "Groceries", emoji: "🥬", amount: 500, envelope: "essentials" },
        ];

    const waitList: WaitItem[] = (waitRows || []).map((w) => ({
      id: w.id,
      label: w.label,
      amount: w.amount_cents,
      envelope: w.envelope as EnvelopeId,
      unlockAt: w.unlock_at,
    }));

    return {
      plan,
      transactions,
      quickActions,
      waitList,
      preferences,
      futureAllocated,
    };
  },

  // Save or update plan
  async savePlan(plan: Partial<Plan>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: Record<string, unknown> = {
      user_id: user.id,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    if (plan.essentialsLimit !== undefined) payload.essentials_limit_cents = plan.essentialsLimit;
    if (plan.funLimit !== undefined) payload.fun_limit_cents = plan.funLimit;
    if (plan.homeFixedMonthly !== undefined) payload.home_fixed_monthly_cents = plan.homeFixedMonthly;
    if (plan.futureFundMonthly !== undefined) payload.future_fund_monthly_cents = plan.futureFundMonthly;
    if (plan.monthlyFlexibleIncome !== undefined) payload.monthly_flexible_income_cents = plan.monthlyFlexibleIncome;
    if (plan.monthlyWorkHours !== undefined) payload.monthly_work_hours = plan.monthlyWorkHours;

    const { data: existing } = await supabase
      .from("plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (existing) {
      await supabase.from("plans").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("plans").insert(payload);
    }
  },

  // Add transaction via RPC with table fallback
  async addTransaction(tx: { clientMutationId: string; amount: number; envelope: EnvelopeId; label: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Execute atomic RPC command, or fallback to direct table insert if RPC is not deployed in remote Postgres schema
    const { data, error } = await supabase.rpc("log_expense", {
      p_amount_cents: tx.amount,
      p_envelope: tx.envelope,
      p_label: tx.label,
      p_client_mutation_id: tx.clientMutationId,
    });

    if (error) {
      // PGRST202: function not found in schema cache -> fallback to direct table insert
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        client_mutation_id: tx.clientMutationId,
        amount_cents: tx.amount,
        envelope: tx.envelope,
        label: tx.label,
      });
      if (insertError) {
        console.warn("Transactions insert error:", insertError.message);
      }
      return null;
    }
    return data;
  },

  // Reverse transaction via RPC with table fallback
  async reverseTransaction(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc("reverse_transaction", {
      p_transaction_id: id,
    });

    if (error) {
      await supabase.from("transactions").update({ reversed: true }).eq("id", id).eq("user_id", user.id);
    }
  },

  // Add wait item
  async addWaitItem(item: { label: string; amount: number; envelope: EnvelopeId; unlockAt: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("wait_items").insert({
      user_id: user.id,
      label: item.label,
      amount_cents: item.amount,
      envelope: item.envelope,
      unlock_at: item.unlockAt,
      status: "waiting",
    });
  },

  // Remove/resolve wait item
  async removeWaitItem(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("wait_items").update({ status: "dismissed" }).eq("id", id).eq("user_id", user.id);
  },

  // Save weekly review
  async saveWeeklyReview(review: { planned: number; spent: number; remainder: number; action: "future" | "carry" | "leave" }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current plan period or create a dummy period if not assigned
    const { data: period } = await supabase
      .from("plan_periods")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_closed", false)
      .maybeSingle();

    let periodId = period?.id;
    if (!periodId) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (plan) {
        const { data: newPeriod } = await supabase
          .from("plan_periods")
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
            weekly_flexible_limit_cents: review.planned,
            spent_cents: review.spent,
          })
          .select("id")
          .single();
        periodId = newPeriod?.id;
      }
    }

    if (periodId) {
      await supabase.from("weekly_reviews").insert({
        user_id: user.id,
        period_id: periodId,
        planned_cents: review.planned,
        spent_cents: review.spent,
        remainder_cents: review.remainder,
        action: review.action,
      });
    }
  },

  // Update preferences
  async updatePreferences(pref: Partial<UserPreferences>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        ...pref,
        updated_at: new Date().toISOString(),
      });
  },

  // Complete onboarding via RPC with table fallback
  async completeOnboarding(plan: Plan) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Try atomic complete_onboarding RPC
    const { data, error } = await supabase.rpc("complete_onboarding", {
      p_essentials_cents: plan.essentialsLimit,
      p_fun_cents: plan.funLimit,
      p_home_fixed_cents: plan.homeFixedMonthly,
      p_future_fund_cents: plan.futureFundMonthly,
      p_monthly_flexible_income_cents: plan.monthlyFlexibleIncome,
      p_monthly_work_hours: plan.monthlyWorkHours,
    });

    if (!error) {
      return data;
    }

    // 2. Fallback if RPC function does not exist in schema cache (PGRST202)
    try {
      // Deactivate existing plans
      await supabase
        .from("plans")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Insert new active plan
      await supabase.from("plans").insert({
        user_id: user.id,
        essentials_limit_cents: plan.essentialsLimit,
        fun_limit_cents: plan.funLimit,
        home_fixed_monthly_cents: plan.homeFixedMonthly,
        future_fund_monthly_cents: plan.futureFundMonthly,
        monthly_flexible_income_cents: plan.monthlyFlexibleIncome,
        monthly_work_hours: plan.monthlyWorkHours,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    } catch (planErr) {
      console.warn("Plans insert warning:", planErr);
    }

    // Always update Supabase Auth user metadata (never fails, no schema cache dependency)
    try {
      await supabase.auth.updateUser({
        data: {
          onboarding_completed_at: new Date().toISOString(),
        },
      });
    } catch (metaErr) {
      console.warn("User metadata update warning:", metaErr);
    }

    // Attempt to mark profile onboarding as completed (silently catch if column is missing)
    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch {
      // Ignore if column does not exist
    }

    return { success: true };
  },

  // Update transaction label or envelope (US-012)
  async updateTransaction(id: string, updates: { label?: string; envelope?: EnvelopeId }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);
  },

  // Record audit events (US-015)
  async recordAuditEvent(eventType: string, payload: Record<string, unknown>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_events").insert({
      user_id: user.id,
      event_type: eventType,
      payload,
    });
  },
};
