import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const messages = [
  { from: "Sarah M.", text: "Need to reschedule tomorrow's appointment...", time: "2m" },
  { from: "Unknown", text: "Hi, I'm having severe chest pain since this morning", time: "4m", urgent: true },
  { from: "James K.", text: "Insurance question about my last visit", time: "8m" },
  { from: "Maria L.", text: "Can someone call me back? Thanks", time: "12m" },
  { from: "+44 7700...", text: "Missed call (3)", time: "15m", urgent: true },
  { from: "Tom R.", text: "Prescription refill request", time: "21m" },
  { from: "Aisha P.", text: "Lab results question — quite worried", time: "28m" },
  { from: "Voicemail", text: "New voicemail • 1:24", time: "33m" },
];

export const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(frame, [0, 30], [40, 0], { extrapolateRight: "clamp" });
  const titleO = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const subO = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Floating message cards behind text */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {messages.map((m, i) => {
          const delay = i * 4;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90 } });
          const drift = Math.sin((frame + i * 30) / 60) * 8;
          const x = 80 + (i % 2) * 1100 + (i % 3) * 40;
          const y = 80 + Math.floor(i / 2) * 230 + drift;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 560,
                opacity: sp * 0.85,
                transform: `translateY(${(1 - sp) * 30}px) scale(${0.95 + sp * 0.05})`,
                background: colors.surface,
                borderRadius: 16,
                padding: "18px 22px",
                boxShadow: "0 8px 32px rgba(11,27,43,0.08)",
                border: `1px solid ${colors.border}`,
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: m.urgent ? colors.red : colors.blueSoft,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.ink }}>{m.from}</div>
                <div style={{ fontSize: 15, color: colors.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.text}
                </div>
              </div>
              <div style={{ fontSize: 13, color: colors.inkSoft }}>{m.time}</div>
            </div>
          );
        })}
      </div>

      {/* Headline overlay */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            background: "rgba(244,247,251,0.85)",
            backdropFilter: "blur(0px)",
            padding: "60px 100px",
            borderRadius: 32,
            textAlign: "center",
            opacity: titleO,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div style={{ fontSize: 28, color: colors.blue, fontWeight: 600, letterSpacing: 6, marginBottom: 24 }}>
            CLINIC COPILOT
          </div>
          <div style={{ fontSize: 110, fontWeight: 800, color: colors.ink, lineHeight: 1.05, letterSpacing: -3 }}>
            Clinics drown in
            <br />
            <span style={{ color: colors.red }}>messages.</span>
          </div>
          <div style={{ fontSize: 28, color: colors.inkSoft, marginTop: 32, opacity: subO }}>
            Every channel. Every hour. No one in control.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
