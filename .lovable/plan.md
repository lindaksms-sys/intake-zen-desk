## Goal
Add a persistent collapsible sidebar to the dashboard with only real, working items. Move the Clinic Intake Copilot brand into the sidebar header and remove the duplicate brand row from the page body. No styling changes to existing dashboard content.

## Changes

### `src/components/AppSidebar.tsx` (recreate)
Shadcn `Sidebar` with `collapsible="icon"`.
- `SidebarHeader`: Activity icon tile + "Clinic Intake Copilot" / "AI-TRIAGED INCOMING CASES" caption.
- `SidebarContent` group:
  - Overview → `Link to="/dashboard"` (active when pathname === `/dashboard`)
  - Staff → `Link to="/dashboard/staff"` (rendered only when `useCurrentMembership().data?.role === "clinic_admin"`)
  - Public Intake Form → `<a href="/intake" target="_blank">` (external)
- `SidebarFooter`: Sign out button → `await supabase.auth.signOut(); queryClient.clear(); navigate({ to: "/auth", replace: true })`.

### `src/routes/_authenticated/dashboard.tsx`
Wrap `<Outlet />` in `SidebarProvider` + `AppSidebar` + a thin header bar containing only `<SidebarTrigger />` so the sidebar can always be toggled.

### `src/routes/_authenticated/dashboard.index.tsx`
Remove the brand block (Activity tile + "Clinic Intake Copilot" / "AI-triaged incoming cases") from the page header. Keep search, Refresh, and Sign-out controls untouched. Everything else (scope tabs, OpsMetrics, StatsCards, urgency tabs, case list) stays exactly as-is.

## Out of scope
- No new routes, no placeholder nav items, no visual restyling of cards/tabs/badges.
