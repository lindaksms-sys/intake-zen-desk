import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LogOut, RefreshCw, Search, Users } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OpsMetrics } from "@/components/OpsMetrics";
import { StatsCards } from "@/components/StatsCards";
import { CaseListItem } from "@/components/CaseListItem";
import { supabase, type CaseLog } from "@/lib/supabase";
import { SAMPLE_CASES } from "@/lib/sample-cases";
import { normalizeUrgency, type UrgencyKey } from "@/lib/urgency";
import { matchesKpi, type KpiFilterKey } from "@/lib/kpi-filters";
import { useClinicStaff } from "@/lib/case-assignment";
import { useCurrentMembership } from "@/lib/clinic";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Clinic Intake Copilot" },
      { name: "description", content: "AI-triaged incoming cases for clinic staff." },
    ],
  }),
  component: Dashboard,
});

async function fetchCases(): Promise<CaseLog[]> {
  const { data, error } = await supabase
    .from("agent_case_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as CaseLog[];
}

type Scope = "mine" | "unassigned" | "assigned" | "all";
type UrgencyTab = "all" | UrgencyKey;

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [urgencyTab, setUrgencyTab] = useState<UrgencyTab>("all");
  const [activeKpi, setActiveKpi] = useState<KpiFilterKey | null>(null);

  const me = useCurrentMembership();
  const isAdmin = me.data?.role === "clinic_admin";
  const myUserId = me.data?.user_id ?? null;

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["agent_case_logs"],
    queryFn: fetchCases,
    refetchOnWindowFocus: false,
  });

  const cases = (data && data.length > 0) ? data : SAMPLE_CASES;
  const staffQuery = useClinicStaff();
  const staffById = useMemo(() => {
    const m = new Map<string, NonNullable<typeof staffQuery.data>[number]>();
    (staffQuery.data ?? []).forEach((s) => m.set(s.user_id, s));
    return m;
  }, [staffQuery.data]);


  const filtered = useMemo(() => {
    return cases.filter((c) => {
      // scope
      if (scope === "mine" && (!myUserId || c.assigned_user_id !== myUserId)) return false;
      if (scope === "unassigned" && c.assigned_user_id) return false;
      if (scope === "assigned" && !c.assigned_user_id) return false;
      // urgency tab
      if (urgencyTab !== "all" && normalizeUrgency(c.urgency_level) !== urgencyTab) return false;
      // kpi
      if (activeKpi && !matchesKpi(c, activeKpi)) return false;
      // search
      if (q) {
        const hay = [
          c.user_message, c.patient_message, c.reason_for_visit,
          c.staff_summary, c.human_readable_summary, c.recommended_queue,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cases, scope, urgencyTab, activeKpi, q, myUserId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  };

  const scopes: Array<{ key: Scope; label: string }> = [
    { key: "mine", label: "My cases" },
    { key: "unassigned", label: "Unassigned" },
    { key: "assigned", label: "Assigned" },
    { key: "all", label: "All" },
  ];

  const urgencyTabs: Array<{ key: UrgencyTab; label: string }> = [
    { key: "all", label: "All" },
    { key: "emergency", label: "Emergency" },
    { key: "urgent", label: "Urgent" },
    { key: "routine", label: "Routine" },
    { key: "admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Toolbar */}
        <header className="flex flex-wrap items-center justify-end gap-4">

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search messages, reasons…"
                className="h-9 pl-9"
              />
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate({ to: "/dashboard/staff" })}>
                <Users className="mr-2 h-4 w-4" /> Staff
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Scope tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-border">
          {scopes.map((s) => {
            const active = scope === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setScope(s.key)}
                className={`relative -mb-px pb-3 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
                {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-foreground" />}
              </button>
            );
          })}
        </div>

        {/* KPI row */}
        <div className="mt-6">
          <OpsMetrics cases={cases} activeKpi={activeKpi} onSelect={(k) => setActiveKpi(activeKpi === k ? null : k)} />
        </div>

        {/* Case mix */}
        <div className="mt-6">
          <StatsCards
            cases={cases}
            activeKpi={activeKpi}
            onSelect={(k) => {
              if (k === "total") setActiveKpi(null);
              else setActiveKpi(activeKpi === k ? null : (k as KpiFilterKey));
            }}
          />
        </div>

        {/* Urgency tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-border">
          {urgencyTabs.map((t) => {
            const active = urgencyTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setUrgencyTab(t.key)}
                className={`relative -mb-px pb-3 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-foreground" />}
              </button>
            );
          })}
        </div>

        {/* Case list */}
        <div className="mt-6 space-y-3 pb-12">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              No cases match the current filters.
            </div>
          ) : (
            filtered.map((c) => (
              <Link
                key={String(c.id)}
                to="/dashboard/cases/$id"
                params={{ id: String(c.id) }}
                className="block"
              >
                <CaseListItem caseLog={c} selected={false} onSelect={() => {}} staffById={staffById} />
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
