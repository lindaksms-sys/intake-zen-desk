import { AlertTriangle, Clock } from "lucide-react";
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
      className={`group relative w-full text-left rounded-lg border transition-all
        ${selected
          ? "border-foreground/20 bg-card shadow-sm"
          : "border-border bg-card hover:border-foreground/10 hover:bg-accent/40"
        }
        ${key === "emergency" ? "ring-1 ring-emergency/15" : ""}
      `}
    >
      <span className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r ${railColor}`} />
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
          {caseLog.escalation_required && (
            <span className="inline-flex items-center gap-1 font-medium text-emergency">
              <AlertTriangle className="h-3 w-3" />
              Escalate
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
