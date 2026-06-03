import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { UrgencyBadge } from "./UrgencyBadge";
import { normalizeUrgency } from "@/lib/urgency";
import type { CaseLog } from "@/lib/supabase";

interface Props {
  caseLog: CaseLog;
  selected: boolean;
  onSelect: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "reviewed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-routine/25 bg-routine-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-routine">
        <CheckCircle2 className="h-2.5 w-2.5" /> Reviewed
      </span>
    );
  }
  if (s === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <XCircle className="h-2.5 w-2.5" /> Closed
      </span>
    );
  }
  return null;
}

export function CaseListItem({ caseLog, selected, onSelect }: Props) {
  const key = normalizeUrgency(caseLog.urgency_level);
  const railColor =
    key === "emergency" ? "bg-emergency"
    : key === "urgent" ? "bg-urgent"
    : key === "routine" ? "bg-routine"
    : "bg-admin";

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative w-full text-left rounded-lg border transition-all
        ${selected
          ? "border-foreground/25 bg-accent/60 shadow-sm ring-1 ring-foreground/10"
          : "border-border bg-card hover:border-foreground/10 hover:bg-accent/30"
        }
        ${key === "emergency" && !selected ? "ring-1 ring-emergency/15" : ""}
      `}
    >
      <span
        className={`absolute left-0 top-2 bottom-2 rounded-r ${railColor} ${
          selected ? "w-1" : "w-0.5"
        }`}
      />
      <div className="px-4 py-3 pl-5">
        <div className="flex items-center justify-between gap-2">
          <UrgencyBadge value={caseLog.urgency_level} />
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(caseLog.created_at)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-foreground leading-snug">
          {caseLog.user_message ?? caseLog.patient_message ?? "—"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">
            → {caseLog.recommended_queue ?? "Unassigned"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {caseLog.case_status && <StatusChip status={caseLog.case_status} />}
            {caseLog.escalation_required && (
              <span className="inline-flex items-center gap-1 font-medium text-emergency">
                <AlertTriangle className="h-3 w-3" />
                Escalate
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
