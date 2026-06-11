import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const fullName = "Sarah Mitchell";
const fullSymptoms = "Severe chest pain since this morning, shortness of breath, feeling dizzy.";

export const Intake = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSp = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });

  // Typewriter
  const nameLen = Math.min(fullName.length, Math.floor(interpolate(frame, [30, 90], [0, fullName.length])));
  const symptomsLen = Math.min(
    fullSymptoms.length,
    Math.max(0, Math.floor(interpolate(frame, [110, 240], [0, fullSymptoms.length]))),
  );

  // AI thinking
  const aiAppear = spring({ frame: frame - 250, fps, config: { damping: 20, stiffness: 120 } });
  const badgeSp = spring({ frame: frame - 290, fps, config: { damping: 8, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 60, flexDirection: "row" }}>
      {/* Intake form */}
      <div
        style={{
          width: 680,
          background: colors.surface,
          borderRadius: 28,
          padding: 56,
          boxShadow: "0 20px 60px rgba(11,27,43,0.10)",
          border: `1px solid ${colors.border}`,
          opacity: cardSp,
          transform: `translateY(${(1 - cardSp) * 40}px)`,
        }}
      >
        <div style={{ fontSize: 14, color: colors.blue, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
          PATIENT INTAKE
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, color: colors.ink, marginBottom: 40, letterSpacing: -1 }}>
          Tell us what's happening
        </div>

        <Field label="Your name">
          <span>{fullName.slice(0, nameLen)}</span>
          {nameLen < fullName.length && frame % 20 < 10 && <Caret />}
        </Field>

        <Field label="What are your symptoms?" tall>
          <span>{fullSymptoms.slice(0, symptomsLen)}</span>
          {symptomsLen > 0 && symptomsLen < fullSymptoms.length && frame % 20 < 10 && <Caret />}
        </Field>

        <div
          style={{
            marginTop: 24,
            background: colors.blue,
            color: "#fff",
            padding: "20px 32px",
            borderRadius: 14,
            fontSize: 20,
            fontWeight: 600,
            textAlign: "center",
            opacity: interpolate(frame, [240, 260], [0.4, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Submit →
        </div>
      </div>

      {/* AI analysis card */}
      <div
        style={{
          width: 520,
          opacity: aiAppear,
          transform: `translateX(${(1 - aiAppear) * 60}px)`,
        }}
      >
        <div
          style={{
            background: colors.surface,
            borderRadius: 28,
            padding: 44,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 20px 60px rgba(11,27,43,0.10)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: colors.teal }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.inkSoft, letterSpacing: 1 }}>
              AI TRIAGE
            </div>
          </div>

          <div style={{ fontSize: 22, color: colors.inkSoft, lineHeight: 1.4, marginBottom: 32 }}>
            Symptoms suggest possible cardiac event. Recommend immediate attention.
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: colors.red,
              color: "#fff",
              padding: "20px 32px",
              borderRadius: 16,
              fontSize: 28,
              fontWeight: 700,
              transform: `scale(${0.6 + badgeSp * 0.4})`,
              opacity: badgeSp,
              boxShadow: `0 12px 40px ${colors.red}55`,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
            URGENT — SEE NOW
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            <Pill color={colors.red} label="Now" active />
            <Pill color={colors.amber} label="Today" />
            <Pill color={colors.green} label="Routine" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Field = ({ label, children, tall }: { label: string; children: React.ReactNode; tall?: boolean }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 16, color: colors.inkSoft, marginBottom: 10, fontWeight: 500 }}>{label}</div>
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 12,
        padding: tall ? "20px 22px" : "18px 22px",
        fontSize: 22,
        color: colors.ink,
        minHeight: tall ? 100 : 30,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  </div>
);

const Caret = () => (
  <span style={{ display: "inline-block", width: 3, height: 24, background: colors.blue, marginLeft: 2, verticalAlign: "middle" }} />
);

const Pill = ({ color, label, active }: { color: string; label: string; active?: boolean }) => (
  <div
    style={{
      padding: "10px 18px",
      borderRadius: 999,
      background: active ? color : "transparent",
      color: active ? "#fff" : colors.inkSoft,
      border: `2px solid ${color}`,
      fontSize: 16,
      fontWeight: 600,
    }}
  >
    {label}
  </div>
);
