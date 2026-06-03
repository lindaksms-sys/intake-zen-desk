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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "./UrgencyBadge";
import type { CaseLog } from "@/lib/supabase";

interface Props {
  caseLog: CaseLog | null;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
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

export function CaseDetail({ caseLog }: Props) {
  if (!caseLog) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-6 py-20">
        <Stethoscope className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-foreground">No case selected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a case from the list to review details.
        </p>
      </div>
    );
  }

  const flags = redFlagsList(caseLog.red_flags);
  const act = (label: string) => toast.success(label, { description: `Case ${caseLog.session_id ?? caseLog.id}` });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge value={caseLog.urgency_level} size="md" />
          {caseLog.escalation_required && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emergency/20 bg-emergency-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emergency">
              <AlertTriangle className="h-3 w-3" />
              Escalation required
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {fmtTime(caseLog.created_at)}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
          {caseLog.reason_for_visit ?? "Reason not specified"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Session {caseLog.session_id ?? "—"} · {caseLog.contact_channel ?? "Unknown channel"} · {caseLog.age_band ?? "Age n/a"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-b border-border px-6 py-3 bg-muted/30">
        <Button size="sm" onClick={() => act("Marked as reviewed")}>
          <CheckCircle2 className="h-4 w-4" /> Mark reviewed
        </Button>
        <Button size="sm" variant="outline" onClick={() => act("Assigned to nurse")}>
          <UserPlus className="h-4 w-4" /> Assign to nurse
        </Button>
        <Button size="sm" variant="outline" onClick={() => act("Assigned to front desk")}>
          <UserPlus className="h-4 w-4" /> Assign to front desk
        </Button>
        <Button size="sm" variant="outline" onClick={() => act("Calling patient…")}>
          <Phone className="h-4 w-4" /> Call patient
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => act("Case closed")}>
          <XCircle className="h-4 w-4" /> Close case
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Recommended queue">{caseLog.recommended_queue ?? "—"}</Field>
          <Field label="Next action">{caseLog.next_action ?? "—"}</Field>
          <Field label="Contact channel">{caseLog.contact_channel ?? "—"}</Field>
          <Field label="Age band">{caseLog.age_band ?? "—"}</Field>
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
            Human-readable summary
          </div>
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            {caseLog.human_readable_summary ?? "—"}
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
      </div>
    </div>
  );
}
