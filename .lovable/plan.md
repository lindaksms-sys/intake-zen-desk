## Goal
Wrap the authenticated dashboard in a shadcn `Sidebar` matching the HerFlow look from the demo screenshot: brand block at top, OPERATE section, CONFIGURE section, collapsible to an icon rail.

## Changes

### 1. New `src/components/AppSidebar.tsx`
- Uses shadcn `Sidebar` with `collapsible="icon"`.
- Brand header: small dark tile + "HerFlow AI" / "CARE COORDINATION" caption.
- Two `SidebarGroup`s:
  - **OPERATE** — Overview, Work Queue, Patients, Appointments, Intake Queue, Open Public Intake Form
  - **CONFIGURE** — Pathways, Campaigns, Reporting, Settings
- Active item highlighted via `useRouterState` against current pathname.
- Items with no route yet render as non-navigating buttons (visual only) so the layout matches the screenshot without breaking type-safe `<Link>`. Routed items today: Overview (`/dashboard`), Staff/Patients (`/dashboard/staff`), Open Public Intake Form (`/intake`, opens new tab).
- Lucide icons: `LayoutGrid, ListChecks, Users, CalendarDays, PhoneCall, ExternalLink, GitBranch, Megaphone, BarChart3, Settings`.

### 2. Edit `src/routes/_authenticated/dashboard.tsx`
Replace the bare `<Outlet />` with:
```tsx
<SidebarProvider>
  <div className="min-h-screen flex w-full">
    <AppSidebar />
    <div className="flex-1 flex flex-col">
      <header className="h-12 flex items-center border-b px-2">
        <SidebarTrigger />
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  </div>
</SidebarProvider>
```
This makes the sidebar apply to all `/dashboard/*` routes (index, staff, cases/$id).

### 3. Existing page chrome
Leave `dashboard.index.tsx` content as-is — the sidebar adds the chrome around it. If the inner page has its own top bar/search, it stays; sidebar trigger lives in the new outer header so it's always reachable when collapsed.

## Out of scope
- Not creating new routes for Work Queue, Appointments, Pathways, Campaigns, Reporting, Settings — those render as inert sidebar items. Tell me if you want me to scaffold any of them.
- Not changing the intake form or auth pages.
