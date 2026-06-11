import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";
import { Logo } from "../components/Logo";

export const CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSp = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const urlO = interpolate(frame, [30, 70], [0, 1], { extrapolateRight: "clamp" });
  const byO = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [40, 110], [0, 480], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
      <div style={{ opacity: logoSp, transform: `scale(${0.9 + logoSp * 0.1})` }}>
        <Logo size={140} />
      </div>

      <div style={{ width: lineW, height: 3, background: colors.blue, borderRadius: 2, marginTop: 10 }} />

      <div
        style={{
          fontSize: 56,
          fontWeight: 600,
          color: colors.ink,
          letterSpacing: -1,
          opacity: urlO,
          marginTop: 10,
        }}
      >
        copilot.<span style={{ color: colors.blue, fontWeight: 700 }}>creativehauz.space</span>
      </div>

      <div
        style={{
          fontSize: 22,
          color: colors.inkSoft,
          letterSpacing: 4,
          opacity: byO,
          marginTop: 30,
          fontWeight: 500,
        }}
      >
        BUILT BY CREATIVE HAUZ
      </div>
    </AbsoluteFill>
  );
};
