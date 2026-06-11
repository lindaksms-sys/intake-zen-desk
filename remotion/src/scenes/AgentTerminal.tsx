import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 20s @ 30fps = 600 frames terminal-style agent log

const BG = "#0B1220";        // app foreground (used as terminal bg)
const SURFACE = "#10172A";
const BORDER = "#1F2942";
const FG = "#E5E9F0";        // app border (light) as terminal fg
const MUTED = "#7B8597";
const ACCENT = "#3C72C9";    // app routine
const URGENT = "#D89438";    // app urgent
const EMERG = "#D94A3D";     // app emergency
const OK = "#5BC07A";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

type Line = {
  t: number;            // frame at which line appears
  text: string;
  color?: string;
  bold?: boolean;
  prefix?: string;      // optional inline colored prefix like "INFO"
  prefixColor?: string;
  indent?: number;
};

const PROMPT = "clinic-copilot $";

const lines: Line[] = [
  { t: 10,  text: `${PROMPT} agent run --case=INT-7042`, color: FG, bold: true },
  { t: 35,  text: "» Starting Clinic Copilot agent v1.4.0", color: MUTED },
  { t: 55,  text: "» Loading triage model: medsbert-triage-2024.11", color: MUTED },
  { t: 80,  text: "» Connected to Supabase (project: intake-zen-desk)", color: MUTED },

  { t: 105, prefix: "INFO ", prefixColor: ACCENT, text: "Received intake payload (id=INT-7042)" },
  { t: 125, prefix: "INFO ", prefixColor: ACCENT, text: "Patient: Maria R., 34 · channel=WhatsApp" },
  { t: 145, prefix: "INFO ", prefixColor: ACCENT, text: "Reason: gynae · symptoms=[bleeding, pelvic_pain]" },

  { t: 175, prefix: "STEP ", prefixColor: MUTED, text: "1/4  Normalizing free-text → structured fields…" },
  { t: 210, prefix: "STEP ", prefixColor: MUTED, text: "2/4  Scoring urgency (rules + LLM)…" },
  { t: 245, prefix: "STEP ", prefixColor: MUTED, text: "3/4  Routing to queue…" },
  { t: 280, prefix: "STEP ", prefixColor: MUTED, text: "4/4  Persisting case record…" },

  { t: 315, text: "", color: FG },
  { t: 315, text: "{", color: FG },
  { t: 325, text: '  "case_id":        "INT-7042",', color: FG },
  { t: 335, text: '  "patient":        "Maria Rodriguez",', color: FG },
  { t: 345, text: '  "age":            34,', color: FG },
  { t: 355, text: '  "channel":        "whatsapp",', color: FG },
  { t: 365, text: '  "category":       "gynae",', color: FG },
  { t: 375, text: '  "symptoms":       ["bleeding", "pelvic_pain"],', color: FG },
  { t: 385, text: '  "severity":       "moderate",', color: FG },
  { t: 395, text: '  "duration_days":  3,', color: FG },
  { t: 405, text: '  "urgency":        "urgent_same_day",', color: URGENT },
  { t: 415, text: '  "queue":          "nurse_review",', color: ACCENT },
  { t: 425, text: '  "red_flags":      ["heavier_than_baseline_bleeding"],', color: FG },
  { t: 435, text: '  "confidence":     0.94', color: FG },
  { t: 445, text: "}", color: FG },

  { t: 470, prefix: "OK   ", prefixColor: OK, text: "INSERT cases  · 1 row  · 38ms" },
  { t: 490, prefix: "OK   ", prefixColor: OK, text: "NOTIFY nurses · channel=triage.urgent" },
  { t: 510, prefix: "DONE ", prefixColor: OK, text: "Case INT-7042 routed in 1.42s", bold: true },
];

const TypedLine: React.FC<{ line: Line; frame: number }> = ({ line, frame }) => {
  const elapsed = frame - line.t;
  if (elapsed < 0) return null;
  const charsPerFrame = 2.6;
  const total = line.text.length;
  const visible = Math.min(total, Math.floor(elapsed * charsPerFrame));
  const text = line.text.slice(0, visible);
  const showCursor = visible < total;
  return (
    <div style={{
      fontFamily: MONO, fontSize: 22, lineHeight: 1.55, color: line.color ?? FG,
      fontWeight: line.bold ? 600 : 400, whiteSpace: "pre", letterSpacing: 0.1,
      paddingLeft: line.indent ?? 0,
    }}>
      {line.prefix && (
        <span style={{ color: line.prefixColor ?? MUTED, fontWeight: 600 }}>{line.prefix}</span>
      )}
      <span>{text}</span>
      {showCursor && (
        <span style={{
          display: "inline-block", width: 10, height: 22, background: line.color ?? FG,
          verticalAlign: "-3px", marginLeft: 2, opacity: Math.floor(frame / 8) % 2 ? 0.85 : 0,
        }} />
      )}
    </div>
  );
};

const StatusBar: React.FC<{ frame: number }> = ({ frame }) => {
  const stage =
    frame < 170 ? "boot" :
    frame < 305 ? "processing" :
    frame < 465 ? "structuring" :
    "persisting";
  const stageLabel: Record<string, string> = {
    boot: "BOOTING",
    processing: "INGEST",
    structuring: "STRUCTURING",
    persisting: "PERSISTING → DONE",
  };
  const stageColor =
    stage === "boot" ? MUTED :
    stage === "processing" ? ACCENT :
    stage === "structuring" ? URGENT : OK;

  // pulse dot
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);

  return (
    <div style={{
      height: 32, display: "flex", alignItems: "center",
      borderTop: `1px solid ${BORDER}`,
      padding: "0 18px", fontFamily: MONO, fontSize: 13, color: MUTED, gap: 18,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: 4, background: stageColor, opacity: 0.4 + pulse * 0.6,
        }} />
        <span style={{ color: stageColor, fontWeight: 600 }}>{stageLabel[stage]}</span>
      </span>
      <span style={{ color: BORDER }}>│</span>
      <span>agent: clinic-copilot</span>
      <span style={{ color: BORDER }}>│</span>
      <span>case: INT-7042</span>
      <span style={{ marginLeft: "auto" }}>
        {String(Math.floor(frame / 30)).padStart(2, "0")}:{String(Math.floor((frame % 30) * 100 / 30)).padStart(2, "0")}s
      </span>
    </div>
  );
};

const Header: React.FC = () => (
  <div style={{
    height: 44, display: "flex", alignItems: "center",
    padding: "0 16px", borderBottom: `1px solid ${BORDER}`,
    background: SURFACE,
  }}>
    <div style={{ display: "flex", gap: 8 }}>
      {["#F25F5F", "#F5BD3A", "#5BC07A"].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />
      ))}
    </div>
    <div style={{
      marginLeft: "auto", marginRight: "auto", display: "flex", alignItems: "center", gap: 10,
      fontFamily: MONO, fontSize: 13, color: MUTED,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 4, background: FG, color: BG,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700,
      }}>C</span>
      clinic-copilot — agent
    </div>
    <div style={{ width: 60 }} />
  </div>
);

export const AgentTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });

  // Auto-scroll: keep latest line in view by translating the list upward
  // 22*1.55 ≈ 34 px line height
  const LH = 34;
  const visibleLines = lines.filter((l) => frame >= l.t).length;
  const MAX_VISIBLE = 18;
  const scroll = Math.max(0, visibleLines - MAX_VISIBLE) * LH;

  return (
    <AbsoluteFill style={{
      background: BG,
      // subtle scanline / vignette via radial overlay
      fontFamily: MONO,
    }}>
      <AbsoluteFill style={{
        background: `radial-gradient(1200px 800px at 20% 0%, ${SURFACE} 0%, transparent 60%), radial-gradient(900px 700px at 100% 100%, ${SURFACE} 0%, transparent 55%)`,
      }} />

      {/* Terminal frame */}
      <div style={{
        position: "absolute", inset: 0, padding: 80,
        opacity: enter, transform: `translateY(${(1 - enter) * 14}px)`,
      }}>
        <div style={{
          height: "100%", borderRadius: 14, border: `1px solid ${BORDER}`,
          background: BG, overflow: "hidden",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column",
        }}>
          <Header />
          <div style={{
            flex: 1, padding: "22px 26px", overflow: "hidden", position: "relative",
          }}>
            <div style={{ transform: `translateY(${-scroll}px)`, transition: "none" }}>
              {lines.map((line, i) => (
                <TypedLine key={i} line={line} frame={frame} />
              ))}
            </div>
          </div>
          <StatusBar frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
