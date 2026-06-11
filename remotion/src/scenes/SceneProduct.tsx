import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadInter("normal", { weights: ["400", "500", "600", "700"] });

type Urgency = "emergency" | "urgent" | "routine" | "admin";

const URG: Record<Urgency, { label: string; fg: string; bg: string }> = {
  emergency: { label: "EMERGENCY", fg: colors.emergency, bg: colors.emergencySoft },
  urgent: { label: "URGENT", fg: colors.urgent, bg: colors.urgentSoft },
  routine: { label: "ROUTINE", fg: colors.routine, bg: colors.routineSoft },
  admin: { label: "ADMIN", fg: colors.admin, bg: "#F1F3F6" },
};

const Tag: React.FC<{ u: Urgency }> = ({ u }) => {
  const c = URG[u];
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1.4,
        color: c.fg,
        background: c.bg,
        padding: "6px 10px",
        borderRadius: 999,
      }}
    >
      {c.label}
    </span>
  );
};

const CASES: { u: Urgency; name: string; line: string; time: string }[] = [
  { u: "emergency", name: "Marcus Reyes", line: "Severe chest pain radiating to left arm. Started 20 min ago.", time: "Just now" },
  { u: "urgent", name: "Priya Anand", line: "High fever 39.4°C, persistent cough, breathing harder since morning.", time: "2m" },
  { u: "routine", name: "Elena Voss", line: "Refill request — Lisinopril 10mg. Last visit Mar 12.", time: "4m" },
  { u: "routine", name: "Daniel Okafor", line: "Booking annual check-up. Mornings preferred.", time: "6m" },
  { u: "admin", name: "Yui Tanaka", line: "Insurance update — new BlueShield card uploaded.", time: "9m" },
];

const Card: React.FC<{ index: number; data: (typeof CASES)[number] }> = ({ index, data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 22 + index * 10;
  const s = spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 130 } });
  const y = interpolate(s, [0, 1], [24, 0]);
  const o = interpolate(s, [0, 1], [0, 1]);
  // tag pops a touch after card
  const tagS = spring({ frame: frame - (delay + 6), fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${y}px)`,
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        boxShadow: "0 1px 0 rgba(11,18,32,0.02)",
      }}
    >
      <div style={{ transform: `scale(${0.4 + 0.6 * tagS})`, opacity: tagS, minWidth: 120 }}>
        <Tag u={data.u} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: colors.fg, marginBottom: 4 }}>{data.name}</div>
        <div style={{ fontSize: 15, color: colors.fgMuted, lineHeight: 1.4 }}>{data.line}</div>
      </div>
      <div style={{ fontSize: 13, color: colors.fgMuted, fontVariantNumeric: "tabular-nums" }}>{data.time}</div>
    </div>
  );
};

const StatBlock: React.FC<{ label: string; value: string; delay: number; accent?: string }> = ({ label, value, delay, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 22 } });
  const o = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [12, 0]);
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${y}px)`,
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.fgMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 600, color: accent ?? colors.fg, marginTop: 6, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
};

export const SceneProduct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Window rise-in
  const winS = spring({ frame, fps, config: { damping: 28, stiffness: 120 } });
  const winY = interpolate(winS, [0, 1], [40, 0]);
  const winO = interpolate(winS, [0, 1], [0, 1]);

  // Subtle drift after settle
  const drift = Math.sin((frame - 60) / 40) * 4;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, padding: 80 }}>
      <div
        style={{
          opacity: winO,
          transform: `translateY(${winY + (frame > 60 ? drift : 0)}px)`,
          width: 1500,
          background: colors.bgSoft,
          border: `1px solid ${colors.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 40px 80px -30px rgba(11,18,32,0.25)",
        }}
      >
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#FEBC2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#28C840" }} />
          <div style={{ marginLeft: 16, fontSize: 13, color: colors.fgMuted }}>clinic-copilot.app / dashboard</div>
        </div>

        {/* Body */}
        <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: colors.fgMuted, letterSpacing: 1.5, fontWeight: 600 }}>OVERVIEW</div>
              <div style={{ fontSize: 30, fontWeight: 600, color: colors.fg, letterSpacing: -0.8, marginTop: 4 }}>Incoming cases</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {(["emergency", "urgent", "routine", "admin"] as Urgency[]).map((u) => (
                <Tag key={u} u={u} />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 14 }}>
            <StatBlock label="Today" value="42" delay={6} />
            <StatBlock label="Emergency" value="2" delay={10} accent={colors.emergency} />
            <StatBlock label="Avg triage time" value="3.1s" delay={14} />
            <StatBlock label="Auto-routed" value="91%" delay={18} accent={colors.routine} />
          </div>

          {/* Case list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CASES.map((c, i) => (
              <Card key={i} index={i} data={c} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
