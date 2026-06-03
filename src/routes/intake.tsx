import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Patient intake — Clinic Intake Copilot" },
      {
        name: "description",
        content:
          "Share your details and reason for visit. A nurse will review your request and follow up.",
      },
    ],
  }),
  component: IntakePage,
});

type ContactChannel = "chat" | "phone" | "whatsapp";
type PregnancyStatus = "unknown" | "not_pregnant" | "possibly" | "pregnant";

interface IntakeResponse {
  id: string | number;
  patient_message: string;
  urgency_level: string;
  recommended_queue: string;
}

const URGENCY_LABEL: Record<string, string> = {
  emergency: "Emergency",
  urgent_same_day: "Urgent — same day",
  routine: "Routine",
  admin_only: "Administrative",
};

const QUEUE_LABEL: Record<string, string> = {
  emergency: "Emergency response",
  nurse_review: "Nurse review",
  front_desk: "Front desk",
};

const EMERGENCY_KEYWORDS = [
  "chest pain", "trouble breathing", "can't breathe", "cant breathe",
  "severe bleeding", "heavy bleeding", "unconscious", "passed out",
  "stroke", "suicidal", "overdose", "anaphylaxis", "severe pain",
];

function detectRedFlag(text: string): boolean {
  const t = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => t.includes(kw));
}

interface FormState {
  full_name: string;
  age_or_dob: string;
  contact_channel: ContactChannel | "";
  contact_value: string;
  reason_for_visit: string;
  details: string;
  pregnancy_status: PregnancyStatus | "";
  last_menstrual_period: string;
  consent: boolean;
}

const INITIAL: FormState = {
  full_name: "",
  age_or_dob: "",
  contact_channel: "",
  contact_value: "",
  reason_for_visit: "",
  details: "",
  pregnancy_status: "",
  last_menstrual_period: "",
  consent: false,
};

function IntakePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IntakeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const redFlag = useMemo(
    () => detectRedFlag(`${form.reason_for_visit} ${form.details}`),
    [form.reason_for_visit, form.details],
  );

  const step1Valid =
    form.full_name.trim().length > 0 &&
    form.age_or_dob.trim().length > 0 &&
    form.contact_channel !== "" &&
    form.contact_value.trim().length > 0;

  const step2Valid =
    form.reason_for_visit.trim().length > 0 &&
    form.details.trim().length >= 3;

  const canSubmit = step1Valid && step2Valid && form.consent;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          age_or_dob: form.age_or_dob.trim(),
          contact_channel: form.contact_channel || null,
          contact_value: form.contact_value.trim(),
          reason_for_visit: form.reason_for_visit.trim(),
          details: form.details.trim(),
          pregnancy_status: form.pregnancy_status || null,
          last_menstrual_period: form.last_menstrual_period.trim() || undefined,
          consent: form.consent,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? "Something went wrong. Please try again.");
      }
      setResult(json as IntakeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNew = () => {
    setForm(INITIAL);
    setResult(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Clinic Intake</p>
            <p className="text-xs text-muted-foreground">Secure patient request</p>
          </div>
        </header>

        {/* Heading */}
        <div className="mt-7">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {result ? "Request received" : "Tell us what is going on"}
          </h1>
          {!result && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A nurse will review your request and follow up. Please share a few details
              so we can help you faster.
            </p>
          )}
        </div>

        {/* Emergency notice — always visible */}
        {!result && (
          <div className="mt-5 flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              If you have severe bleeding, chest pain, trouble breathing, or feel very
              unwell, seek urgent medical care immediately.
            </p>
          </div>
        )}

        {/* Red-flag inline warning while typing */}
        {!result && redFlag && (
          <div className="mt-3 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-destructive">
              What you described may need urgent care. Please call your local emergency
              number or go to the nearest emergency room. You can still submit this
              request so our team is aware.
            </p>
          </div>
        )}

        {result ? (
          <ResponseCard result={result} onNew={handleNew} />
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <Stepper step={step} />

            {step === 1 && (
              <StepContact form={form} set={set} />
            )}
            {step === 2 && (
              <StepReason form={form} set={set} />
            )}
            {step === 3 && (
              <StepReview form={form} set={set} />
            )}

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            {/* Nav */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Review &amp; submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {!result && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Your information is sent securely to the clinic team.
          </p>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Contact" },
    { n: 2, label: "Reason" },
    { n: 3, label: "Review" },
  ];
  return (
    <ol className="mb-6 flex items-center gap-2">
      {items.map((it, i) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <li key={it.n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                done
                  ? "border-foreground bg-foreground text-background"
                  : active
                    ? "border-foreground bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : it.n}
            </div>
            <span
              className={`text-xs ${
                active ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {it.label}
            </span>
            {i < items.length - 1 && (
              <div className="ml-1 h-px flex-1 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

type SetFn = <K extends keyof FormState>(k: K, v: FormState[K]) => void;

function StepContact({ form, set }: { form: FormState; set: SetFn }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          required
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Maria Rodriguez"
          autoComplete="name"
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age_or_dob">Age or date of birth</Label>
        <Input
          id="age_or_dob"
          required
          value={form.age_or_dob}
          onChange={(e) => set("age_or_dob", e.target.value)}
          placeholder="34 or 1991-04-12"
          maxLength={40}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="channel">Preferred contact</Label>
          <Select
            value={form.contact_channel}
            onValueChange={(v) => set("contact_channel", v as ContactChannel)}
          >
            <SelectTrigger id="channel">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_value">Phone or WhatsApp</Label>
          <Input
            id="contact_value"
            required
            value={form.contact_value}
            onChange={(e) => set("contact_value", e.target.value)}
            placeholder="+1 555 123 4567"
            inputMode="tel"
            autoComplete="tel"
            maxLength={60}
          />
        </div>
      </div>
    </div>
  );
}

function StepReason({ form, set }: { form: FormState; set: SetFn }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for visit</Label>
        <Input
          id="reason"
          required
          value={form.reason_for_visit}
          onChange={(e) => set("reason_for_visit", e.target.value)}
          placeholder="Pelvic pain, prenatal check-up, prescription refill…"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Symptoms or request details</Label>
        <Textarea
          id="details"
          required
          value={form.details}
          onChange={(e) => set("details", e.target.value)}
          placeholder="When did it start? How severe is it? Any related symptoms?"
          rows={5}
          maxLength={2000}
          className="resize-none"
        />
        <p className="text-[11px] text-muted-foreground">{form.details.length}/2000</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pregnancy">
            Pregnancy status <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Select
            value={form.pregnancy_status}
            onValueChange={(v) => set("pregnancy_status", v as PregnancyStatus)}
          >
            <SelectTrigger id="pregnancy">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Prefer not to say</SelectItem>
              <SelectItem value="not_pregnant">Not pregnant</SelectItem>
              <SelectItem value="possibly">Possibly pregnant</SelectItem>
              <SelectItem value="pregnant">Pregnant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lmp">
            Last menstrual period <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="lmp"
            type="date"
            value={form.last_menstrual_period}
            onChange={(e) => set("last_menstrual_period", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function StepReview({ form, set }: { form: FormState; set: SetFn }) {
  const channelLabel: Record<string, string> = {
    chat: "Chat",
    phone: "Phone",
    whatsapp: "WhatsApp",
  };
  const pregnancyLabel: Record<string, string> = {
    unknown: "Prefer not to say",
    not_pregnant: "Not pregnant",
    possibly: "Possibly pregnant",
    pregnant: "Pregnant",
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Review your details
        </p>
        <dl className="mt-2 divide-y divide-border">
          <ReviewRow label="Full name" value={form.full_name} />
          <ReviewRow label="Age / DOB" value={form.age_or_dob} />
          <ReviewRow
            label="Contact"
            value={
              form.contact_channel
                ? `${channelLabel[form.contact_channel]} · ${form.contact_value}`
                : form.contact_value
            }
          />
          <ReviewRow label="Reason for visit" value={form.reason_for_visit} />
          <ReviewRow label="Details" value={form.details} />
          {form.pregnancy_status && (
            <ReviewRow
              label="Pregnancy status"
              value={pregnancyLabel[form.pregnancy_status]}
            />
          )}
          <ReviewRow label="Last menstrual period" value={form.last_menstrual_period} />
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Emergency disclaimer.</span>{" "}
          This intake form is not for emergencies. If you are experiencing a medical
          emergency, call your local emergency number or go to the nearest emergency
          room right away.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
        <Checkbox
          id="consent"
          checked={form.consent}
          onCheckedChange={(v) => set("consent", v === true)}
          className="mt-0.5"
        />
        <span className="text-xs leading-relaxed text-foreground">
          I consent to the clinic team contacting me about this request and storing the
          information I provided for my medical record.
        </span>
      </label>
    </div>
  );
}

function ResponseCard({
  result,
  onNew,
}: {
  result: IntakeResponse;
  onNew: () => void;
}) {
  const urgency = URGENCY_LABEL[result.urgency_level] ?? result.urgency_level;
  const queue = QUEUE_LABEL[result.recommended_queue] ?? result.recommended_queue;
  const isEmergency = result.urgency_level === "emergency";

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isEmergency
              ? "bg-destructive/10 text-destructive"
              : "bg-foreground/5 text-foreground"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold">
            The clinic has received your request.
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {result.patient_message}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Urgency
          </dt>
          <dd
            className={`mt-1 font-medium ${
              isEmergency ? "text-destructive" : "text-foreground"
            }`}
          >
            {urgency}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Routed to
          </dt>
          <dd className="mt-1 font-medium text-foreground">{queue}</dd>
        </div>
      </dl>

      <Button variant="outline" className="mt-5 w-full" onClick={onNew}>
        Send another request
      </Button>
    </div>
  );
}
