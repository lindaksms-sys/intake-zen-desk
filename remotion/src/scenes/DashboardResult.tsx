import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 25s @ 30fps = 750 frames
// 0-60     Dashboard fades in (toolbar, scope tabs, KPIs visible)
// 60-150   Case list appears with stagger
// 150-280  New case INT-7042 slides in at top, urgent pulse
// 280-440  Camera zooms toward case row, then case detail panel opens
// 440-600  Detail held; status / assignment / triage summary visible
// 600-680  Fade to closing screen
// 680-750  "Built for clinic intake triage." hold

// ---- App tokens (mirror src/styles.css) ----
const BG = "#FBFCFD";
const BG_SOFT = "#F4F6F9";
const FG = "#0B1220";
const MUTED = "#5B6573";
const BORDER = "#E5E9F0";
const CARD = "#FFFFFF";

const EMERGENCY = "#D94A3D";
const EMERGENCY_SOFT = "#FBE9E7";
const URGENT = "#D89438";
const URGENT_SOFT = "#FBF1DC";
const ROUTINE = "#3C72C9";
const ROUTINE_SOFT = "#E6EEFA";
const ADMIN = "#7E8794";
const ADMIN_SOFT = "#EFF1F5";

const SANS = "Inter, system-ui, sans-serif";

// ---- Icons ----
const Icon: React.FC<{ d: string; size?: number; color?: string; stroke?: number }> = ({ d, size = 16, color = FG, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const SearchIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const Activity = ({ size = 14, color = BG }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ---- Layout helpers ----
const Toolbar: React.FC = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingBottom: 22,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: FG, color: BG,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Activity />
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: FG }}>Clinic Intake Copilot</div>
        <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase" }}>
          AI-triaged incoming cases
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{
        height: 34, width: 240, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD,
        display: "flex", alignItems: "center", gap: 8, padding: "0 12px",
        fontSize: 13, color: MUTED,
      }}>
        <SearchIcon />Search messages, reasons…
      </div>
      <div style={{
        height: 34, padding: "0 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD,
        display: "flex", alignItems: "center", fontSize: 13, color: FG, gap: 6,
      }}>Staff</div>
      <div style={{
        height: 34, padding: "0 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD,
        display: "flex", alignItems: "center", fontSize: 13, color: FG,
      }}>Refresh</div>
    </div>
  </div>
);

const ScopeTabs: React.FC = () => (
  <div style={{ display: "flex", gap: 28, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
    {[{ l: "My cases" }, { l: "Unassigned" }, { l: "Assigned" }, { l: "All", a: true }].map((t) => (
      <div key={t.l} style={{
        fontSize: 13, fontWeight: 500, color: t.a ? FG : MUTED,
        borderBottom: t.a ? `2px solid ${FG}` : "none", paddingBottom: 10, marginBottom: -12,
      }}>{t.l}</div>
    ))}
  </div>
);

type Kpi = { label: string; value: string; sub: string; tone: "emergency" | "urgent" | "routine" | "admin" | "neutral" };

const TONE: Record<string, { bg: string; fg: string }> = {
  emergency: { bg: EMERGENCY_SOFT, fg: EMERGENCY },
  urgent: { bg: URGENT_SOFT, fg: URGENT },
  routine: { bg: ROUTINE_SOFT, fg: ROUTINE },
  admin: { bg: ADMIN_SOFT, fg: ADMIN },
  neutral: { bg: BG_SOFT, fg: FG },
};

const KpiCard: React.FC<{ k: Kpi; progress: number }> = ({ k, progress }) => {
  const t = TONE[k.tone];
  return (
    <div style={{
      flex: 1, borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD,
      padding: 16, opacity: progress, transform: `translateY(${(1 - progress) * 14}px)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          padding: "3px 8px", borderRadius: 6, background: t.bg, color: t.fg,
          fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase",
        }}>{k.label}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: FG, letterSpacing: -0.5 }}>{k.value}</div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{k.sub}</div>
    </div>
  );
};

const UrgencyBadge: React.FC<{ tone: keyof typeof TONE; label: string }> = ({ tone, label }) => {
  const t = TONE[tone];
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 6, background: t.bg, color: t.fg,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase",
    }}>{label}</span>
  );
};

type Case = {
  id: string; name: string; age: number; preview: string; queue: string;
  urgency: "emergency" | "urgent" | "routine" | "admin"; urgencyLabel: string;
  time: string; assignedTo: string | null;
};

const CASES: Case[] = [
  { id: "INT-7042", name: "Maria Rodriguez", age: 34, preview: "Heavier bleeding than usual for 3 days, mild pelvic cramps. No fever.",
    queue: "Nurse review", urgency: "urgent", urgencyLabel: "Urgent · same day", time: "just now", assignedTo: null },
  { id: "INT-7041", name: "Aisha Mwangi", age: 28, preview: "Reschedule prenatal appointment to next week.",
    queue: "Front desk", urgency: "admin", urgencyLabel: "Administrative", time: "2m", assignedTo: "Linda K." },
  { id: "INT-7040", name: "Janet Otieno", age: 41, preview: "Started new contraception, asking about side effects.",
    queue: "Nurse review", urgency: "routine", urgencyLabel: "Routine", time: "6m", assignedTo: "Priya S." },
  { id: "INT-7039", name: "Sofia Kim", age: 29, preview: "Severe lower-abdomen pain after delivery, fever 38.6°C.",
    queue: "Emergency response", urgency: "emergency", urgencyLabel: "Emergency", time: "11m", assignedTo: "Dr. Owino" },
  { id: "INT-7038", name: "Rita Ndlovu", age: 36, preview: "Missed period, possibly pregnant, requesting confirmation visit.",
    queue: "Nurse review", urgency: "routine", urgencyLabel: "Routine", time: "23m", assignedTo: "Linda K." },
];

const CaseRow: React.FC<{ c: Case; progress: number; highlight?: number }> = ({ c, progress, highlight = 0 }) => {
  const glow = highlight > 0
    ? `0 0 0 ${2 * highlight}px ${URGENT}33, 0 8px 30px -10px ${URGENT}55`
    : "0 1px 2px rgba(11,18,32,0.04)";
  const border = highlight > 0.1 ? URGENT : BORDER;
  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${border}`, background: CARD,
      padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
      opacity: progress, transform: `translateY(${(1 - progress) * 10}px)`,
      boxShadow: glow,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 999, background: BG_SOFT,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, color: FG, flexShrink: 0,
      }}>{c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: FG }}>
            {c.name} <span style={{ color: MUTED, fontWeight: 400 }}>· {c.age}</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>· {c.id}</div>
          {highlight > 0.3 && (
            <span style={{
              padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700,
              background: URGENT, color: "#fff", letterSpacing: 0.6,
              opacity: highlight,
            }}>NEW</span>
          )}
        </div>
        <div style={{
          fontSize: 12, color: MUTED, marginTop: 3, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 720,
        }}>{c.preview}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <UrgencyBadge tone={c.urgency} label={c.urgencyLabel} />
        <div style={{ fontSize: 11, color: MUTED }}>
          {c.assignedTo ? c.assignedTo : "Unassigned"} · {c.time}
        </div>
      </div>
    </div>
  );
};

// ---- Detail panel ----
const DetailPanel: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  const c = CASES[0];
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `rgba(11,18,32,${0.35 * progress})`,
      display: "flex", justifyContent: "flex-end",
      pointerEvents: "none",
    }}>
      <div style={{
        width: 720, background: BG, height: "100%",
        borderLeft: `1px solid ${BORDER}`,
        padding: "32px 36px",
        transform: `translateX(${(1 - progress) * 80}px)`,
        boxShadow: "-30px 0 60px -20px rgba(11,18,32,0.18)",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UrgencyBadge tone="urgent" label="Urgent · same day" />
          <span style={{ fontSize: 11, color: MUTED }}>Case {c.id}</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 24, fontWeight: 600, color: FG, letterSpacing: -0.4 }}>
          {c.name}, {c.age}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
          WhatsApp · +254 712 408 559 · received just now
        </div>

        <div style={{
          marginTop: 22, padding: 16, borderRadius: 12, border: `1px solid ${BORDER}`,
          background: CARD,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Patient message
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: FG, lineHeight: 1.6 }}>
            {c.preview}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: 16, borderRadius: 12, border: `1px solid ${BORDER}`,
          background: CARD,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Triage summary
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: FG, lineHeight: 1.6 }}>
            Moderate vaginal bleeding for 3 days with mild pelvic discomfort. No fever, no syncope.
            Recommend same-day nurse review; rule out heavier-than-baseline bleeding.
          </div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["bleeding", "pelvic_pain", "no_fever", "moderate"].map((t) => (
              <span key={t} style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 6,
                background: BG_SOFT, color: FG, border: `1px solid ${BORDER}`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        }}>
          <KV label="Status" value="Open" />
          <KV label="Queue" value="Nurse review" valueColor={ROUTINE} />
          <KV label="Assigned to" value="Linda Kisimisi" />
          <KV label="Confidence" value="0.94" />
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <div style={{
            height: 36, padding: "0 14px", borderRadius: 8, background: FG, color: BG,
            display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500,
          }}>Mark in progress</div>
          <div style={{
            height: 36, padding: "0 14px", borderRadius: 8, background: CARD, color: FG,
            border: `1px solid ${BORDER}`,
            display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500,
          }}>Reassign</div>
        </div>
      </div>
    </div>
  );
};

const KV: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor = FG }) => (
  <div style={{
    padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD,
  }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: valueColor, marginTop: 4 }}>{value}</div>
  </div>
);

// ---- Closing screen ----
const Closing: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  const titleP = Math.min(1, Math.max(0, (progress - 0.1) / 0.6));
  return (
    <AbsoluteFill style={{
      background: BG, display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", opacity: progress, fontFamily: SANS,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: FG, color: BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${0.85 + titleP * 0.15})`,
      }}>
        <Activity size={26} />
      </div>
      <div style={{
        marginTop: 26, fontSize: 44, fontWeight: 600, color: FG, letterSpacing: -1,
        opacity: titleP, transform: `translateY(${(1 - titleP) * 8}px)`,
      }}>
        Built for clinic intake triage.
      </div>
      <div style={{
        marginTop: 14, fontSize: 14, color: MUTED, letterSpacing: 1.8, textTransform: "uppercase",
        opacity: titleP,
      }}>
        Clinic Intake Copilot
      </div>
    </AbsoluteFill>
  );
};

// ---- Main ----
export const DashboardResult: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageEnter = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });

  // KPI stagger
  const kpiProgress = (i: number) =>
    spring({ frame: frame - 25 - i * 6, fps, config: { damping: 22, stiffness: 100 } });

  // Case list stagger (starts ~frame 70). The new top case (index 0) animates separately.
  const caseProgress = (i: number) => {
    if (i === 0) {
      // New case slides in around frame 150
      return spring({ frame: frame - 150, fps, config: { damping: 22, stiffness: 110 } });
    }
    return spring({ frame: frame - 70 - i * 7, fps, config: { damping: 22, stiffness: 100 } });
  };

  // Highlight pulse on new case 150-290
  const highlight = (() => {
    if (frame < 150) return 0;
    if (frame > 290) return interpolate(frame, [290, 320], [1, 0], { extrapolateRight: "clamp" });
    const pulse = 0.6 + 0.4 * Math.sin((frame - 150) / 5);
    const enter = Math.min(1, (frame - 150) / 20);
    return pulse * enter;
  })();

  // Camera: zoom in toward case row #0 between 280-360
  const zoomT = interpolate(frame, [280, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = 1 + zoomT * 0.06;
  const translateY = -zoomT * 60;

  // Detail panel opens 320-420
  const detailProgress = interpolate(frame, [320, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Closing fade 600-680
  const closing = interpolate(frame, [600, 680], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dashboardOpacity = interpolate(frame, [600, 680], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const kpis: Kpi[] = [
    { label: "Emergency", value: "2", sub: "Open · response queue", tone: "emergency" },
    { label: "Urgent", value: "6", sub: "Same-day nurse review", tone: "urgent" },
    { label: "Routine", value: "21", sub: "Scheduled this week", tone: "routine" },
    { label: "Administrative", value: "13", sub: "Front desk", tone: "admin" },
    { label: "Auto-routed", value: "91%", sub: "Of cases today", tone: "neutral" },
  ];

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: SANS, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, opacity: dashboardOpacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: "50% 38%",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "40px 32px",
          opacity: pageEnter,
        }}>
          <Toolbar />
          <ScopeTabs />

          {/* KPI row */}
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            {kpis.map((k, i) => <KpiCard key={k.label} k={k} progress={kpiProgress(i)} />)}
          </div>

          {/* Urgency sub-tabs */}
          <div style={{
            display: "flex", gap: 28, borderBottom: `1px solid ${BORDER}`,
            paddingBottom: 12, marginTop: 28,
            opacity: kpiProgress(4),
          }}>
            {[{ l: "All", a: true }, { l: "Emergency" }, { l: "Urgent" }, { l: "Routine" }, { l: "Admin" }].map((t) => (
              <div key={t.l} style={{
                fontSize: 13, fontWeight: 500, color: t.a ? FG : MUTED,
                borderBottom: t.a ? `2px solid ${FG}` : "none",
                paddingBottom: 10, marginBottom: -12,
              }}>{t.l}</div>
            ))}
          </div>

          {/* Case list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {CASES.map((c, i) => (
              <CaseRow key={c.id} c={c} progress={caseProgress(i)} highlight={i === 0 ? highlight : 0} />
            ))}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      <div style={{ opacity: dashboardOpacity }}>
        <DetailPanel progress={detailProgress} />
      </div>

      {/* Closing */}
      <Closing progress={closing} />
    </AbsoluteFill>
  );
};
