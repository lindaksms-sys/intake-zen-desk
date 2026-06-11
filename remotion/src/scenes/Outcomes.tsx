import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const stats = [
  { value: 4.2, suffix: "h", label: "Saved per day", color: colors.blue },
  { value: 38, suffix: "%", label: "Faster response", color: colors.teal },
  { value: 2, suffix: "×", label: "More bookings", color: colors.red },
];

export const Outcomes = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSp = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 80 }}>
      <div
        style={{
          fontSize: 32,
          color: colors.blue,
          fontWeight: 600,
          letterSpacing: 6,
          opacity: titleSp,
        }}
      >
        THE RESULT
      </div>
      <div style={{ display: "flex", gap: 60 }}>
        {stats.map((s, i) => {
          const delay = 20 + i * 25;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 110 } });
          const num = interpolate(sp, [0, 1], [0, s.value]);
          const display = s.value < 10 && s.value % 1 !== 0 ? num.toFixed(1) : Math.round(num).toString();
          return (
            <div
              key={i}
              style={{
                background: colors.surface,
                borderRadius: 32,
                padding: "60px 70px",
                border: `1px solid ${colors.border}`,
                boxShadow: "0 30px 80px rgba(11,27,43,0.10)",
                textAlign: "center",
                minWidth: 360,
                opacity: sp,
                transform: `translateY(${(1 - sp) * 40}px) scale(${0.9 + sp * 0.1})`,
              }}
            >
              <div
                style={{
                  fontSize: 180,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                  letterSpacing: -6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {display}
                <span style={{ fontSize: 100 }}>{s.suffix}</span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: colors.inkSoft,
                  marginTop: 16,
                  fontWeight: 500,
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
