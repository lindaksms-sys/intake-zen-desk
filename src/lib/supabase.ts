import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key — safe to ship in client bundle.
const SUPABASE_URL = "https://solhhlgccmrpzzljvjqb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qSqCS4vTOPC01LIlNhVYqA_LvhWb9gi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

export type Urgency = "emergency" | "urgent_same_day" | "routine" | "admin_only" | string;

export type CaseStatus = "new" | "reviewed" | "in_progress" | "closed" | string;

export interface CaseLog {
  id?: string | number;
  session_id: string | null;
  user_message: string | null;
  age_band: string | null;
  contact_channel: string | null;
  reason_for_visit: string | null;
  urgency_level: Urgency | null;
  case_status?: CaseStatus | null;
  recommended_queue: string | null;
  escalation_required: boolean | null;
  red_flags: string[] | string | null;
  next_action: string | null;
  staff_summary: string | null;
  patient_message: string | null;
  human_readable_summary: string | null;
  created_at: string;
}
