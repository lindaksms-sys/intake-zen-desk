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
    { label: "Total cases", value: cases.length, accent: undefined, dot: "bg-foreground/30" },
    {
      label: "Emergency",
      value: counts.emergency,
      accent: counts.emergency > 0 ? "text-emergency" : undefined,
      dot: "bg-emergency",
    },
    { label: "Routine", value: counts.routine, accent: undefined, dot: "bg-foreground/20" },
    { label: "Admin", value: counts.admin, accent: undefined, dot: "bg-foreground/20" },
  ];

  return (
    <section aria-label="Case mix">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Case mix
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-lg border border-border/70 bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {it.label}
              </span>
            </div>
            <div className={`mt-0.5 text-lg font-semibold tabular-nums ${it.accent ?? "text-foreground"}`}>
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
