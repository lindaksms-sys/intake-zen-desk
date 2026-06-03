import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const IntakeSchema = z.object({
  message: z.string().trim().min(3).max(2000),
  contact_channel: z.enum(["chat", "phone", "whatsapp"]).optional().nullable(),
  age_band: z.enum(["unknown", "teen_20s", "30s_40s", "50s_60s"]).optional().nullable(),
});

const EMERGENCY_KEYWORDS = [
  "chest pain", "trouble breathing", "can't breathe", "cant breathe",
  "severe bleeding", "heavy bleeding", "unconscious", "passed out",
  "stroke", "suicidal", "overdose", "anaphylaxis", "severe pain",
];
const URGENT_KEYWORDS = [
  "bleeding", "spotting", "fever", "pain", "vomit", "infection",
  "pregnan", "swelling", "rash", "burn", "injury",
];
const ADMIN_KEYWORDS = [
  "appointment", "reschedul", "prescription refill", "refill",
  "records", "invoice", "billing", "insurance",
];

function triage(message: string) {
  const m = message.toLowerCase();
  const red_flags: string[] = [];
  for (const kw of EMERGENCY_KEYWORDS) if (m.includes(kw)) red_flags.push(kw);

  let urgency_level: string = "routine";
  let recommended_queue = "nurse_review";
  let escalation_required = false;
  let next_action = "Nurse will review your message and follow up.";
  let patient_message =
    "Thank you for sharing this. A nurse will review your message and reach out with next steps.";

  if (red_flags.length > 0) {
    urgency_level = "emergency";
    recommended_queue = "emergency";
    escalation_required = true;
    next_action = "Advise patient to seek emergency care immediately.";
    patient_message =
      "Your symptoms may require urgent medical attention. Please seek emergency care now or call your local emergency number. Our team has also been alerted.";
  } else if (URGENT_KEYWORDS.some((kw) => m.includes(kw))) {
    urgency_level = "urgent_same_day";
    recommended_queue = "nurse_review";
    next_action = "Offer same-day nurse callback.";
    patient_message =
      "Thank you for reaching out. A nurse will review your message today and contact you with next steps.";
  } else if (ADMIN_KEYWORDS.some((kw) => m.includes(kw))) {
    urgency_level = "admin_only";
    recommended_queue = "front_desk";
    next_action = "Front desk will handle administrative request.";
    patient_message =
      "Thanks — your request has been routed to our front desk team. They will follow up shortly.";
  }

  return {
    urgency_level,
    recommended_queue,
    escalation_required,
    red_flags,
    next_action,
    patient_message,
  };
}

export const Route = createFileRoute("/api/public/intake")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = IntakeSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const { message, contact_channel, age_band } = parsed.data;
        const t = triage(message);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const session_id = crypto.randomUUID();
        const human_readable_summary = message.length > 140
          ? `${message.slice(0, 137)}…`
          : message;
        const staff_summary = `[${t.urgency_level}] ${human_readable_summary}`;

        const { data, error } = await supabaseAdmin
          .from("agent_case_logs")
          .insert({
            session_id,
            user_message: message,
            age_band: age_band ?? null,
            contact_channel: contact_channel ?? null,
            reason_for_visit: null,
            urgency_level: t.urgency_level,
            recommended_queue: t.recommended_queue,
            escalation_required: t.escalation_required,
            red_flags: t.red_flags,
            next_action: t.next_action,
            staff_summary,
            patient_message: t.patient_message,
            human_readable_summary,
            case_status: "new",
          })
          .select("id, patient_message, urgency_level, recommended_queue")
          .single();

        if (error) {
          console.error("[intake] insert failed", error);
          return Response.json(
            { error: "Could not save your message. Please try again." },
            { status: 500 },
          );
        }

        return Response.json({
          id: data.id,
          patient_message: data.patient_message,
          urgency_level: data.urgency_level,
          recommended_queue: data.recommended_queue,
        });
      },
    },
  },
});
