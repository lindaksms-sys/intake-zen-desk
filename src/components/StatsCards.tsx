import { normalizeUrgency } from "@/lib/urgency";
import type { CaseLog } from "@/lib/supabase";

interface Props {
  cases: CaseLog[];
}

export function StatsCards({ cases }: Props) {
  const counts = cases.reduce(
    (acc, c) => {
      const k = normalizeUrgency(c.urgency_level);
      acc[k] += 1;
      return acc;
    },
    { emergency: 0, urgent: 0, routine: 0, admin: 0 } as Record<string, number>,
  );

  const items = [
    { label: "Total cases", value: cases.length, accent: "text-foreground", dot: "bg-foreground/30" },
    { label: "Emergency", value: counts.emergency, accent: "text-emergency", dot: "bg-emergency" },
    { label: "Urgent", value: counts.urgent, accent: "text-urgent", dot: "bg-urgent" },
    { label: "Routine", value: counts.routine, accent: "text-routine", dot: "bg-routine" },
    { label: "Admin", value: counts.admin, accent: "text-admin", dot: "bg-admin" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {it.label}
            </span>
          </div>
          <div className={`mt-1 text-2xl font-semibold tabular-nums ${it.accent}`}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
