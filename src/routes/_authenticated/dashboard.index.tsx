import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Bell,
  LogOut,
  Inbox,
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  UserMinus,
  CheckCircle2,
  Mic,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase, type CaseLog } from "@/lib/supabase";
import { SAMPLE_CASES } from "@/lib/sample-cases";
import { normalizeUrgency } from "@/lib/urgency";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — Clinic Intake Copilot" },
      { name: "description", content: "Today's intakes, urgent cases, bookings, and follow-ups at a glance." },
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

function isToday(iso?: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type KpiTone = "teal" | "amber" | "rose" | "green" | "slate" | "indigo";

const TONES: Record<KpiTone, { bg: string; fg: string }> = {
  teal:   { bg: "bg-teal-50",    fg: "text-teal-700" },
  amber:  { bg: "bg-amber-50",   fg: "text-amber-700" },
  rose:   { bg: "bg-rose-50",    fg: "text-rose-700" },
  green:  { bg: "bg-emerald-50", fg: "text-emerald-700" },
  slate:  { bg: "bg-slate-100",  fg: "text-slate-700" },
  indigo: { bg: "bg-indigo-50",  fg: "text-indigo-700" },
};

function KpiCard({
  icon: Icon, value, label, sublabel, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  label: string;
  sublabel: string;
  tone: KpiTone;
}) {
  const t = TONES[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${t.bg}`}>
        <Icon className={`h-5 w-5 ${t.fg}`} />
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sublabel}</div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const name =
        (u.user_metadata?.full_name as string | undefined) ??
        (u.user_metadata?.name as string | undefined) ??
        u.email?.split("@")[0] ??
        "Staff";
      setUser({ email: u.email ?? "", name });
    });
  }, []);

  const { data } = useQuery({
    queryKey: ["agent_case_logs"],
    queryFn: fetchCases,
    refetchOnWindowFocus: false,
  });

  const cases = (data && data.length > 0) ? data : SAMPLE_CASES;

  const stats = useMemo(() => {
    const today = cases.filter((c) => isToday(c.created_at));
    const newIntakes = today.filter((c) => !c.case_status || c.case_status === "new").length;
    const urgent = cases.filter((c) => {
      const u = normalizeUrgency(c.urgency_level);
      const open = !c.case_status || c.case_status === "new" || c.case_status === "in_progress" || c.case_status === "reviewed";
      return open && (u === "emergency" || u === "urgent");
    }).length;
    const booked = cases.filter((c) => !!c.assigned_user_id && isToday(c.assigned_at ?? c.created_at)).length;
    const closedToday = cases.filter((c) => c.case_status === "closed" && isToday(c.closed_at ?? c.updated_at ?? c.created_at)).length;
    const missed = cases.filter((c) => {
      if (!c.created_at) return false;
      const ageDays = (Date.now() - new Date(c.created_at).getTime()) / 86400000;
      return ageDays > 7 && c.case_status !== "closed";
    }).length;
    const inactive = 0;

    const voiceToday = today.filter((c) => (c.contact_channel ?? "").toLowerCase().includes("voice")).length;
    const urgentVoice = today.filter((c) => {
      const u = normalizeUrgency(c.urgency_level);
      return (c.contact_channel ?? "").toLowerCase().includes("voice") && (u === "emergency" || u === "urgent");
    }).length;
    const latestVoice = cases.find((c) => (c.contact_channel ?? "").toLowerCase().includes("voice"))?.created_at ?? null;
    const unresolvedAlerts = cases.filter((c) => c.escalation_required && c.case_status !== "closed").length;

    return { newIntakes, urgent, booked, closedToday, missed, inactive, voiceToday, urgentVoice, latestVoice, unresolvedAlerts };
  }, [cases]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  };

  const initials = (user?.name ?? "S").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-right" />

      {/* Top toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients, episodes, tasks…"
            className="h-9 pl-9 bg-muted/40"
          />
        </div>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-medium text-foreground">{user?.name ?? "Staff"}</div>
                <div className="text-[11px] text-muted-foreground">{user?.email ?? ""}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/staff" })}>
              Staff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Heading row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[38px] font-semibold tracking-tight text-foreground leading-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Today at a glance — new intakes, urgent cases, bookings, and follow-ups.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
          >
            Open Work Queue <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* KPI grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard icon={Inbox}         tone="teal"   value={stats.newIntakes}   label="New intakes"        sublabel="Awaiting triage today" />
          <KpiCard icon={AlertTriangle} tone="amber"  value={stats.urgent}       label="Urgent cases"       sublabel="Emergency + urgent, open" />
          <KpiCard icon={CalendarCheck} tone="teal"   value={stats.booked}       label="Booked consults"    sublabel="Assigned today" />
          <KpiCard icon={CalendarX}     tone="rose"   value={stats.missed}       label="Missed follow-ups"  sublabel="Open beyond 7 days" />
          <KpiCard icon={UserMinus}     tone="slate"  value={stats.inactive}     label="Inactive patients"  sublabel="No activity 30 days" />
          <KpiCard icon={CheckCircle2}  tone="green"  value={stats.closedToday}  label="Follow-up complete" sublabel="Closed today" />
        </div>

        {/* Intake Activity */}
        <div className="mt-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">INTAKE ACTIVITY</div>
            <div className="mt-1 text-sm text-muted-foreground">Voice and web submissions arriving today</div>
          </div>
          <Link to="/intake" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
            Open Intake Queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Mic}         tone="teal"   value={stats.voiceToday}      label="Voice intakes"        sublabel="Received today" />
          <KpiCard icon={AlertTriangle} tone="amber" value={stats.urgentVoice}    label="Urgent voice intakes" sublabel="Need triage now" />
          <KpiCard icon={Clock}       tone="indigo" value={timeAgo(stats.latestVoice)} label="Latest voice intake" sublabel="Most recent arrival" />
          <KpiCard icon={ShieldAlert} tone="rose"   value={stats.unresolvedAlerts} label="Unresolved alerts"   sublabel="Escalations still open" />
        </div>
      </main>
    </div>
  );
}
