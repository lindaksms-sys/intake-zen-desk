import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

type NodeDef = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  tone: "ink" | "blue" | "teal" | "amber";
  delay: number;
};

const NODES: NodeDef[] = [
  { id: "patient",  label: "Patient",          sub: "WhatsApp · SMS · Web",   x: 120,  y: 360, w: 260, tone: "ink",   delay: 0 },
  { id: "intake",   label: "Intake form",      sub: "TanStack Start route",    x: 470,  y: 360, w: 280, tone: "blue",  delay: 8 },
  { id: "edge",     label: "Server function",  sub: "/api/public/intake",      x: 840,  y: 360, w: 280, tone: "blue",  delay: 14 },
  { id: "agent",    label: "Triage agent",     sub: "Lovable AI · Gemini 2.5", x: 1210, y: 240, w: 300, tone: "amber", delay: 22 },
  { id: "db",       label: "Supabase",         sub: "Postgres + RLS",          x: 1210, y: 480, w: 300, tone: "teal",  delay: 22 },
  { id: "dash",     label: "Staff dashboard",  sub: "Realtime queue",          x: 1580, y: 360, w: 240, tone: "ink",   delay: 32 },
];

const EDGES: Array<{ from: string; to: string; delay: number; label?: string }> = [
  { from: "patient", to: "intake", delay: 4,  label: "submit" },
  { from: "intake",  to: "edge",   delay: 12 },
  { from: "edge",    to: "agent",  delay: 20, label: "triage" },
  { from: "agent",   to: "db",     delay: 30, label: "persist" },
  { from: "edge",    to: "db",     delay: 30 },
  { from: "db",      to: "dash",   delay: 38, label: "realtime" },
];

const TONE: Record<NodeDef["tone"], { bg: string; fg: string; border: string }> = {
  ink:   { bg: colors.card,         fg: colors.fg,       border: colors.border },
  blue:  { bg: colors.routineSoft,  fg: colors.routine,  border: "#C9DAF4" },
  teal:  { bg: "#DEF3EF",           fg: colors.teal,     border: "#B9E3DC" },
  amber: { bg: colors.urgentSoft,   fg: colors.urgent,   border: "#EFD9A8" },
};

const nodeById = (id: string) => NODES.find((n) => n.id === id)!;

const Node: React.FC<{ n: NodeDef }> = ({ n }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - n.delay, fps, config: { damping: 24, stiffness: 130 } });
  const o = interpolate(sp, [0, 1], [0, 1]);
  const y = interpolate(sp, [0, 1], [10, 0]);
  const tone = TONE[n.tone];
  return (
    <div
      style={{
        position: "absolute",
        left: n.x - n.w / 2,
        top: n.y - 38,
        width: n.w,
        padding: "14px 18px",
        borderRadius: 14,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        opacity: o,
        transform: `translateY(${y}px)`,
        boxShadow: "0 8px 22px -10px rgba(11,18,32,0.12)",
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: tone.fg, letterSpacing: -0.2 }}>{n.label}</div>
      <div style={{ fontSize: 12, color: colors.fgMuted, marginTop: 3 }}>{n.sub}</div>
    </div>
  );
};

const Edge: React.FC<{ from: string; to: string; delay: number; label?: string }> = ({ from, to, delay, label }) => {
  const frame = useCurrentFrame();
  const a = nodeById(from);
  const b = nodeById(to);
  const x1 = a.x + a.w / 2 - 12;
  const x2 = b.x - b.w / 2 + 12;
  const y1 = a.y;
  const y2 = b.y;
  const cx = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  const len = 1000; // approx
  const draw = interpolate(frame, [delay, delay + 22], [len, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(frame, [delay - 2, delay + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Packet dot
  const pktT = ((frame - delay - 10) % 60) / 60;
  const pktVisible = frame > delay + 18 && pktT >= 0;
  // Approx along curve using midpoint between control & endpoints
  const px = x1 + (x2 - x1) * pktT;
  const py = y1 + (y2 - y1) * pktT - Math.sin(pktT * Math.PI) * 8;
  return (
    <g opacity={o}>
      <path
        d={path}
        fill="none"
        stroke={colors.border}
        strokeWidth={1.5}
      />
      <path
        d={path}
        fill="none"
        stroke={colors.fg}
        strokeWidth={2}
        strokeDasharray={len}
        strokeDashoffset={draw}
        strokeLinecap="round"
      />
      {label && (
        <text
          x={cx}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fontFamily={fontFamily}
          fontSize={11}
          fontWeight={600}
          fill={colors.fgMuted}
          letterSpacing={1}
          style={{ textTransform: "uppercase" }}
        >
          {label}
        </text>
      )}
      {pktVisible && <circle cx={px} cy={py} r={4} fill={colors.routine} />}
    </g>
  );
};

export const SceneArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const headerSp = spring({ frame, fps: 30, config: { damping: 22 } });
  const headerO = interpolate(headerSp, [0, 1], [0, 1]);
  const headerY = interpolate(headerSp, [0, 1], [12, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgSoft} 100%)`,
        fontFamily,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerO,
          transform: `translateY(${headerY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 3,
            color: colors.routine,
            background: colors.routineSoft,
            padding: "5px 12px",
            borderRadius: 999,
            marginBottom: 16,
          }}
        >
          ARCHITECTURE
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: colors.fg, letterSpacing: -1.2 }}>
          How a case flows in under 3 seconds
        </div>
      </div>

      {/* Edges layer */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {EDGES.map((e, i) => (
          <Edge key={i} {...e} />
        ))}
      </svg>

      {/* Nodes */}
      {NODES.map((n) => (
        <Node key={n.id} n={n} />
      ))}

      {/* Footnote */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 120,
          textAlign: "center",
          fontSize: 16,
          color: colors.fgMuted,
          opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        TanStack Start · Lovable AI · Supabase Postgres · Realtime
      </div>
    </AbsoluteFill>
  );
};
