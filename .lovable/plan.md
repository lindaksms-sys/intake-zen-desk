## Goal
Make `/dashboard` look like the HerFlow Overview screenshot — big "Overview" title, "Open Work Queue" pill, a 6-tile KPI grid, and an "INTAKE ACTIVITY" row of 4 voice tiles. The sidebar layout stays.

## Changes

### Rewrite `src/routes/_authenticated/dashboard.index.tsx`
Remove the old in-page header (Activity logo, search input, Staff/Refresh/Sign-out buttons, scope tabs, OpsMetrics, StatsCards, filter tabs, case list). Replace the page body with:

1. **Top toolbar inside the page**: a wide search input ("Search patients, episodes, tasks…"), a bell icon, and a user chip (initials + name + email pulled from the authenticated Supabase user). This sits under the existing layout header.
2. **Heading row**: `Overview` (large, bold) + subtitle "Today at a glance — new intakes, urgent cases, bookings, and follow-ups." On the right, a teal pill button "Open Work Queue →" that navigates to `/dashboard` with `scope=unassigned` (closest existing "work queue" semantics).
3. **KPI grid (6 cards)** computed from live `agent_case_logs` (fallback to `SAMPLE_CASES`):
   - New intakes — created today, awaiting triage
   - Urgent cases — open + emergency/urgent
   - Booked consults — count of cases with `assigned_user_id` set this period
   - Missed follow-ups — closed cases past 7 days with no follow-up flag (best-effort from existing fields; if not available, show 0)
   - Inactive patients — placeholder 0
   - Follow-up complete — closed today
   Each card: tinted square icon (teal / amber / teal / rose / slate / green), big number, label, sublabel.
4. **INTAKE ACTIVITY section**: small caption "INTAKE ACTIVITY" + subtitle "Voice and web submissions arriving today", with a right-aligned "Open Intake Queue →" link to `/intake`. Below: 4 tiles — Voice intakes today, Urgent voice intakes, Latest voice intake (time), Unresolved urgent alerts. Values derived from the same case data; unknown ones show "—" or 0.

### Trim the layout
- Keep `dashboard.tsx` layout + sidebar as-is.
- Move the sign-out action into a small dropdown on the user chip in the new toolbar so the existing logout path stays reachable.

### Out of scope
- No new DB tables or migrations. Metrics use existing `agent_case_logs` fields with sensible fallbacks.
- Case list, scope tabs, urgency filters, OpsMetrics, StatsCards components are removed from `/dashboard`. (They remain available — case detail still works at `/dashboard/cases/$id`. If you want a separate "Work Queue" page that keeps the old list, say so and I'll scaffold `/dashboard/queue`.)
