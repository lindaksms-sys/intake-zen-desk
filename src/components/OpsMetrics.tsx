import { useMemo } from "react";
import type { CaseLog } from "@/lib/supabase";
import { normalizeUrgency } from "@/lib/urgency";

interface Props {
  cases: CaseLog[];
}

function isToday(iso?: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = mins / 60;
  if (hrs < 24) {
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const days = hrs / 24;
  const d = Math.floor(days);
  const h = Math.round((days - d) * 24);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export function OpsMetrics({ cases }: Props) {
  const metrics = useMemo(() => {
    let newToday = 0;
    let urgentOpen = 0;
    let nurseQ = 0;
    let frontDeskQ = 0;
    let closedToday = 0;
    let closeSum = 0;
    let closeCount = 0;

    for (const c of cases) {
      const closed = c.case_status === "closed";
      if (isToday(c.created_at)) newToday++;
      const u = normalizeUrgency(c.urgency_level);
      if (!closed && (u === "emergency" || u === "urgent")) urgentOpen++;
      if (!closed && c.assigned_to_queue === "nurse_review") nurseQ++;
      if (!closed && c.assigned_to_queue === "front_desk") frontDeskQ++;
      if (isToday(c.closed_at)) closedToday++;
      if (closed && c.closed_at && c.created_at) {
        const d = new Date(c.closed_at).getTime() - new Date(c.created_at).getTime();
        if (d > 0) {
          closeSum += d;
          closeCount++;
        }
      }
    }

    return {
      newToday,
      urgentOpen,
      nurseQ,
      frontDeskQ,
      closedToday,
      avgClose: closeCount ? formatDuration(closeSum / closeCount) : "—",
    };
  }, [cases]);

  const items = [
    { label: "New today", value: metrics.newToday, dot: "bg-foreground/30" },
    { label: "Urgent open", value: metrics.urgentOpen, dot: "bg-urgent", accent: metrics.urgentOpen > 0 ? "text-urgent" : undefined },
    { label: "Nurse review", value: metrics.nurseQ, dot: "bg-foreground/30" },
    { label: "Front desk", value: metrics.frontDeskQ, dot: "bg-foreground/30" },
    { label: "Closed today", value: metrics.closedToday, dot: "bg-routine" },
    { label: "Avg time to close", value: metrics.avgClose, dot: "bg-foreground/30" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          <div className={`mt-1 text-2xl font-semibold tabular-nums ${it.accent ?? "text-foreground"}`}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
