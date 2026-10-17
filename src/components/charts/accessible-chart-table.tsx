"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Table } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibleChartTableProps {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}

export function AccessibleChartTable({ caption, headers, rows }: AccessibleChartTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-border/40 pt-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <Table className="size-3.5" />
        <span>{isOpen ? "Hide data table" : "Show accessible data table"}</span>
        {isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>

      {isOpen && (
        <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-secondary/20 p-2 animate-in fade-in-50">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                {headers.map((h, i) => (
                  <th key={i} scope="col" className="pb-1.5 pt-1 px-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-secondary/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={cn("py-1.5 px-2", cIdx > 0 && "font-mono")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
