"use client";
 
import { useState } from "react";
import { CheckCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QueueItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "incident" | "moderation" | "config_warning" | "experiment_anomaly";
  title: string;
  description: string;
  age: string;
  status: "pending" | "investigating" | "resolved";
}

const mockQueue: QueueItem[] = [
  {
    id: "q-101",
    severity: "critical",
    category: "incident",
    title: "Exchange Rate Feed Stale (USD/KHR)",
    description: "National Bank of Cambodia fx feed has not published an update in 18 hours. Fallback cache active.",
    age: "24m ago",
    status: "pending",
  },
  {
    id: "q-102",
    severity: "high",
    category: "moderation",
    title: "Leaderboard Alias Flagged",
    description: "User alias 'ScamHunter_99' reported for impersonation. Review needed before weekly season close.",
    age: "1h ago",
    status: "investigating",
  },
  {
    id: "q-103",
    severity: "medium",
    category: "config_warning",
    title: "Khmer Localization Untranslated Keys",
    description: "3 new coach response strings in 'safety_first' template fallback to en-KH.",
    age: "3h ago",
    status: "pending",
  },
  {
    id: "q-104",
    severity: "low",
    category: "experiment_anomaly",
    title: "Sunday Sweep Opt-in Experiment Cohort B",
    description: "Cohort conversion variance exceeds 2.1 standard deviations. Statistical check advised.",
    age: "5h ago",
    status: "pending",
  },
];

export function OverviewQueue() {
  const [items, setItems] = useState<QueueItem[]>(mockQueue);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filtered = items.filter((item) =>
    filterSeverity === "all" ? true : item.severity === filterSeverity
  );

  const resolveItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "resolved" } : i))
    );
  };

  const getSeverityBadge = (sev: QueueItem["severity"]) => {
    switch (sev) {
      case "critical":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "high":
        return "bg-warning/15 text-warning border-warning/30";
      case "medium":
        return "bg-secondary text-foreground border-border";
      case "low":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Attention Queue</h2>
          <p className="text-sm text-muted-foreground">
            Operational triage ordered by severity and age. Minimum privilege access enforced.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="h-10 min-w-[140px] text-xs font-semibold">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical Only</SelectItem>
              <SelectItem value="high">High Only</SelectItem>
              <SelectItem value="medium">Medium Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl border border-border bg-card p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4",
              item.status === "resolved" && "opacity-50"
            )}
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                    getSeverityBadge(item.severity)
                  )}
                >
                  {item.severity}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{item.age}</span>
                <span className="text-xs text-muted-foreground capitalize">· {item.category}</span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.status === "resolved" ? (
                <span className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <CheckCircle className="size-4" /> Resolved
                </span>
              ) : (
                <>
                  <button
                    onClick={() => resolveItem(item.id)}
                    className="h-9 px-4 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => resolveItem(item.id)}
                    className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
