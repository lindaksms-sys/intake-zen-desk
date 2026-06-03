import {
  AlertTriangle,
  CheckCircle2,
  Phone,
  UserPlus,
  XCircle,
  Stethoscope,
  Mail,
  Clock,
  ListChecks,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "./UrgencyBadge";
import type { CaseLog } from "@/lib/supabase";

interface Props {
  caseLog: CaseLog | null;
  onMarkReviewed?: (c: CaseLog) => void;
  isMarking?: boolean;
  onCloseCase?: (c: CaseLog) => void;
  isClosing?: boolean;
  onAssign?: (c: CaseLog, queue: "nurse_review" | "front_desk") => void;
  isAssigning?: boolean;
}

function queueLabel(q: string | null | undefined): string {
  if (!q) return "Unassigned";
  if (q === "nurse_review") return "Nurse review";
  if (q === "front_desk") return "Front desk";
  return q.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function redFlagsList(value: CaseLog["red_flags"]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

function statusLabel(s: string | null | undefined): string {
  if (!s) return "New";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusTone(s: string | null | undefined): string {
  const v = (s ?? "new").toLowerCase();
  if (v === "reviewed") return "border-routine/25 bg-routine-soft text-routine";
  if (v === "closed") return "border-border bg-muted text-muted-foreground";
  if (v === "in_progress") return "border-urgent/25 bg-urgent-soft text-urgent";
  return "border-foreground/15 bg-card text-foreground";
}

function SummaryCell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-sm font-medium text-foreground truncate">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export function CaseDetail({ caseLog, onMarkReviewed, isMarking, onCloseCase, isClosing, onAssign, isAssigning }: Props) {
  if (!caseLog) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-6 py-20">
        <Stethoscope className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-foreground">Select a case to review details</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a case from the list on the left.
        </p>
      </div>
    );
  }

  const flags = redFlagsList(caseLog.red_flags);
  const status = (caseLog.case_status ?? "new").toLowerCase();
  const isClosed = status === "closed";
  const reviewedDisabled = status === "reviewed" || isClosed || !!isMarking;
  const closeDisabled = isClosed || !!isClosing;
  const assignDisabled = isClosed || !!isAssigning;
  const assignedQueue = caseLog.assigned_to_queue;
  const act = (label: string) =>
    toast.success(label, { description: `Case ${caseLog.session_id ?? caseLog.id}` });

  return (
    <div className="flex h-full flex-col">
      {/* Header strip */}
      <div className="border-b border-border px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {caseLog.session_id ?? `#${caseLog.id}`}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-[11px] text-muted-foreground">
            {caseLog.contact_channel ?? "Unknown channel"}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-[11px] text-muted-foreground">{caseLog.age_band ?? "Age n/a"}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {caseLog.reason_for_visit ?? "Reason not specified"}
        </h2>
      </div>

      {/* Summary block */}
      <div className="px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          <SummaryCell label="Status">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${statusTone(caseLog.case_status)}`}
            >
              {statusLabel(caseLog.case_status)}
            </span>
          </SummaryCell>
          <SummaryCell label="Urgency">
            <UrgencyBadge value={caseLog.urgency_level} />
          </SummaryCell>
          <SummaryCell label="Queue">
            <span className="inline-flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
              {caseLog.recommended_queue ?? "Unassigned"}
            </span>
          </SummaryCell>
          <SummaryCell label="Escalation">
            {caseLog.escalation_required ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emergency/25 bg-emergency-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emergency">
                <ShieldAlert className="h-3 w-3" /> Required
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Not required</span>
            )}
          </SummaryCell>
        </div>
      </div>

      {/* Actions */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1">
            <Button
              size="sm"
              disabled={reviewedDisabled}
              onClick={() => onMarkReviewed?.(caseLog)}
            >
              <CheckCircle2 className="h-4 w-4" />
              {status === "reviewed" ? "Reviewed" : "Mark reviewed"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={assignDisabled}
              onClick={() => onAssign?.(caseLog, "nurse_review")}
            >
              <UserPlus className="h-4 w-4" />
              {assignedQueue === "nurse_review" ? "Nurse ✓" : "Nurse"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={assignDisabled}
              onClick={() => onAssign?.(caseLog, "front_desk")}
            >
              <UserPlus className="h-4 w-4" />
              {assignedQueue === "front_desk" ? "Front desk ✓" : "Front desk"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act("Calling patient…")}>
              <Phone className="h-4 w-4" /> Call
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-muted-foreground"
            disabled={closeDisabled}
            onClick={() => onCloseCase?.(caseLog)}
          >
            <XCircle className="h-4 w-4" /> {isClosed ? "Closed" : "Close case"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Key triage fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Next action">{caseLog.next_action ?? "—"}</Field>
          <Field label="Human-readable summary">{caseLog.human_readable_summary ?? "—"}</Field>
        </div>

        {flags.length > 0 && (
          <div className="rounded-lg border border-emergency/20 bg-emergency-soft px-4 py-3">
            <div className="flex items-center gap-2 text-emergency">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Red flags</span>
            </div>
            <ul className="mt-2 space-y-1">
              {flags.map((f, i) => (
                <li key={i} className="text-sm text-foreground">• {f}</li>
              ))}
            </ul>
          </div>
        )}

        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            Staff summary
          </div>
          <p className="mt-2 rounded-md border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
            {caseLog.staff_summary ?? "No staff summary generated."}
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Patient-facing message
          </div>
          <p className="mt-2 rounded-md border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
            {caseLog.patient_message ?? "—"}
          </p>
        </section>

        <section>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Original patient message
          </div>
          <blockquote className="mt-2 rounded-md border-l-2 border-foreground/20 bg-muted/40 px-4 py-3 text-sm italic text-foreground">
            {caseLog.user_message ?? "—"}
          </blockquote>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-muted-foreground border-t border-border">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Logged {fmtTime(caseLog.created_at)}
          </span>
          {caseLog.reviewed_at && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-routine" />
              Reviewed {fmtTime(caseLog.reviewed_at)}
            </span>
          )}
          {caseLog.closed_at && (
            <span className="flex items-center gap-1.5">
              <XCircle className="h-3 w-3 text-muted-foreground" />
              Closed {fmtTime(caseLog.closed_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
