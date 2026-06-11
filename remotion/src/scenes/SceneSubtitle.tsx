import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadInter("normal", { weights: ["400", "500", "600"] });

const Word: React.FC<{ text: string; delay: number; accent?: boolean }> = ({ text, delay, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 140 } });
  const y = interpolate(s, [0, 1], [24, 0]);
  const o = interpolate(s, [0, 1], [0, 1]);
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${y}px)`,
        opacity: o,
        color: accent ? colors.routine : colors.fg,
        marginRight: 18,
      }}
    >
      {text}
    </span>
  );
};

export const SceneSubtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const ruleW = interpolate(frame, [0, 30], [0, 96], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, maxWidth: 1400, textAlign: "center" }}>
        <div style={{ width: ruleW, height: 2, background: colors.routine, borderRadius: 2 }} />
        <div
          style={{
            fontSize: 78,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          <Word text="AI" delay={2} accent />
          <Word text="triage" delay={8} />
          <Word text="for" delay={14} />
          <Word text="clinic" delay={20} />
          <Word text="intake." delay={26} />
        </div>
        <div
          style={{
            opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" }),
            fontSize: 18,
            fontWeight: 500,
            color: colors.fgMuted,
            letterSpacing: 0.4,
          }}
        >
          Every message classified. Every urgency surfaced. In seconds.
        </div>
      </div>
    </AbsoluteFill>
  );
};
