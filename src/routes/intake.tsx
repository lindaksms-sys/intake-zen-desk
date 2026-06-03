import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
          "Tell our clinic team what's going on. A nurse will review your message and follow up.",
      },
    ],
  }),
  component: IntakePage,
});

type ContactChannel = "chat" | "phone" | "whatsapp";
type AgeBand = "unknown" | "teen_20s" | "30s_40s" | "50s_60s";

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

function IntakePage() {
  const [message, setMessage] = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel | "">("");
  const [ageBand, setAgeBand] = useState<AgeBand | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IntakeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          contact_channel: contactChannel || null,
          age_band: ageBand || null,
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
    setMessage("");
    setContactChannel("");
    setAgeBand("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
        {/* Logo / title */}
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Clinic Intake</p>
            <p className="text-xs text-muted-foreground">Secure patient message</p>
          </div>
        </header>

        {/* Heading */}
        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tell us what is going on
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Share a few sentences about what you're experiencing. A nurse will review your
            message and follow up. Urgent symptoms may require immediate medical attention.
          </p>
        </div>

        {/* Safety note */}
        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            If you have severe bleeding, chest pain, trouble breathing, or feel very unwell,
            seek urgent medical care immediately.
          </p>
        </div>

        {/* Form or response */}
        {result ? (
          <ResponseCard result={result} onNew={handleNew} />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Your message
                </Label>
                <Textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I have had pelvic pain and spotting for 2 days and would like help."
                  rows={6}
                  maxLength={2000}
                  className="resize-none bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  {message.length}/2000
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="channel" className="text-sm font-medium">
                    Preferred contact <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    value={contactChannel}
                    onValueChange={(v) => setContactChannel(v as ContactChannel)}
                  >
                    <SelectTrigger id="channel" className="bg-background">
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
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age band <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select value={ageBand} onValueChange={(v) => setAgeBand(v as AgeBand)}>
                    <SelectTrigger id="age" className="bg-background">
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="teen_20s">Teen or 20s</SelectItem>
                      <SelectItem value="30s_40s">30s or 40s</SelectItem>
                      <SelectItem value="50s_60s">50s or 60s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit intake"
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                Your message is sent securely to the clinic team.
              </p>
            </div>
          </form>
        )}
      </div>
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
            Your message has been received by the clinic team.
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
        Send another message
      </Button>
    </div>
  );
}
