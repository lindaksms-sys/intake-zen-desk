import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const STATS = [
  { value: 3.1, suffix: "s",  label: "Avg triage time",   tone: colors.routine },
  { value: 91,  suffix: "%",  label: "Auto-routed",       tone: colors.teal },
  { value: 4.2, suffix: "h",  label: "Saved per day",     tone: colors.urgent },
];

export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowSp = spring({ frame, fps, config: { damping: 22 } });
  const titleSp = spring({ frame: frame - 14, fps, config: { damping: 22 } });
  const subSp = spring({ frame: frame - 26, fps, config: { damping: 22 } });
  const tagSp = spring({ frame: frame - 220, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 35%, ${colors.bgSoft} 0%, ${colors.bg} 70%)`,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          opacity: 0.16,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Headline */}
      <div style={{ textAlign: "center", maxWidth: 1500, padding: "0 80px", marginTop: -60 }}>
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
            marginBottom: 22,
            opacity: eyebrowSp,
            transform: `translateY(${interpolate(eyebrowSp, [0, 1], [8, 0])}px)`,
          }}
        >
          THE IMPACT
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: colors.fg,
            letterSpacing: -2.6,
            lineHeight: 1.02,
            opacity: titleSp,
            transform: `translateY(${interpolate(titleSp, [0, 1], [12, 0])}px)`,
          }}
        >
          No patient waits in the dark.
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 22,
            color: colors.fgMuted,
            fontWeight: 500,
            opacity: subSp,
            transform: `translateY(${interpolate(subSp, [0, 1], [8, 0])}px)`,
          }}
        >
          Every intake triaged, routed, and answered — in seconds, not hours.
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "flex",
          gap: 28,
          marginTop: 72,
        }}
      >
        {STATS.map((s, i) => {
          const delay = 60 + i * 14;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 } });
          const o = interpolate(sp, [0, 1], [0, 1]);
          const y = interpolate(sp, [0, 1], [24, 0]);
          const num = interpolate(sp, [0, 1], [0, s.value]);
          const display = s.value % 1 !== 0 ? num.toFixed(1) : Math.round(num).toString();
          return (
            <div
              key={i}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                padding: "36px 48px",
                minWidth: 320,
                textAlign: "center",
                opacity: o,
                transform: `translateY(${y}px)`,
                boxShadow: "0 20px 50px -28px rgba(11,18,32,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: s.tone,
                  letterSpacing: -3,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {display}
                <span style={{ fontSize: 56 }}>{s.suffix}</span>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  fontWeight: 500,
                  color: colors.fgMuted,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tag */}
      <div
        style={{
          marginTop: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: tagSp,
          transform: `translateY(${interpolate(tagSp, [0, 1], [8, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: colors.fg,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: colors.fg, letterSpacing: -0.4 }}>
          Clinic Intake Copilot
        </div>
      </div>
    </AbsoluteFill>
  );
};
