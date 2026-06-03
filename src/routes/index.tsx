import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Activity, RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase, type CaseLog } from "@/lib/supabase";
import { SAMPLE_CASES } from "@/lib/sample-cases";
import { normalizeUrgency, type UrgencyKey } from "@/lib/urgency";
import { StatsCards } from "@/components/StatsCards";
import { CaseListItem } from "@/components/CaseListItem";
import { CaseDetail } from "@/components/CaseDetail";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinic Intake Copilot" },
      { name: "description", content: "AI-triaged incoming patient cases for clinic staff review." },
    ],
  }),
  component: Dashboard,
});

type FilterKey = "all" | UrgencyKey;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "emergency", label: "Emergency" },
  { key: "urgent", label: "Urgent" },
  { key: "routine", label: "Routine" },
  { key: "admin", label: "Admin" },
];

async function fetchCases(): Promise<CaseLog[]> {
  const { data, error } = await supabase
    .from("agent_case_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as CaseLog[];
}

function Dashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["agent_case_logs"],
    queryFn: fetchCases,
    refetchOnWindowFocus: false,
  });

  const liveCases = data ?? [];
  const usingSample = !isLoading && !isError && liveCases.length === 0;
  const allCases = liveCases.length > 0 ? liveCases : SAMPLE_CASES;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCases.filter((c) => {
      if (filter !== "all" && normalizeUrgency(c.urgency_level) !== filter) return false;
      if (!q) return true;
      return [c.user_message, c.staff_summary, c.reason_for_visit]
        .some((f) => (f ?? "").toLowerCase().includes(q));
    });
  }, [allCases, filter, query]);

  const selected = filtered.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (c: CaseLog) => {
    setSelectedId(c.id ?? null);
    if (isMobile) setMobileOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Clinic Intake Copilot</h1>
                <p className="text-xs text-muted-foreground">AI-triaged incoming cases</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {usingSample && (
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Showing sample data
                </span>
              )}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search messages, reasons…"
                  className="h-9 w-64 pl-8 bg-card"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <StatsCards cases={allCases} />
          </div>

          <div className="mt-4 flex gap-1 border-b border-transparent">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors
                    ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                  `}
                >
                  {f.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {isError && (
          <div className="mb-4 rounded-lg border border-emergency/20 bg-emergency-soft px-4 py-3 text-sm text-emergency">
            Couldn't reach Supabase. Showing sample data so you can preview the UI.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(340px,420px)_1fr]">
          {/* Case list */}
          <section aria-label="Case list" className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[92px] w-full rounded-lg" />
              ))
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
                <p className="text-sm font-medium text-foreground">No cases found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try changing the filter or clearing your search.
                </p>
              </div>
            ) : (
              filtered.map((c, idx) => (
                <CaseListItem
                  key={(c.id ?? c.session_id ?? idx) as React.Key}
                  caseLog={c}
                  selected={selected ? selected.id === c.id : false}
                  onSelect={() => handleSelect(c)}
                />
              ))
            )}
          </section>

          {/* Detail — sticky on desktop; mobile uses Sheet below */}
          <section
            aria-label="Case detail"
            className="hidden lg:block rounded-lg border border-border bg-card lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden"
          >
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <CaseDetail caseLog={selected} />
            )}
          </section>
        </div>
      </main>

      {/* Mobile detail drawer */}
      <Sheet open={isMobile && mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
          <CaseDetail caseLog={selected} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
