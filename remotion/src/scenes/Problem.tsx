import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";
import { Logo } from "../components/Logo";

export const Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50 }}>
      <div style={{ opacity: sp, transform: `scale(${0.9 + sp * 0.1})` }}>
        <Logo size={96} />
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 600,
          color: colors.inkSoft,
          textAlign: "center",
          maxWidth: 1400,
          opacity: interpolate(frame, [20, 60], [0, 1], { extrapolateRight: "clamp" }),
          letterSpacing: -1,
        }}
      >
        An AI front desk that <span style={{ color: colors.blue, fontWeight: 700 }}>never sleeps.</span>
      </div>
    </AbsoluteFill>
  );
};
