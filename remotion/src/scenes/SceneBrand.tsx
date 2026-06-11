import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadInter("normal", { weights: ["400", "500", "600", "700"] });

// Activity-style pulse icon (mirrors lucide Activity)
const PulseMark: React.FC<{ progress: number }> = ({ progress }) => {
  // progress 0..1 controls stroke draw
  const length = 220;
  const offset = (1 - progress) * length;
  return (
    <div
      style={{
        width: 112,
        height: 112,
        borderRadius: 24,
        background: colors.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 60px -20px rgba(11,18,32,0.35)",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h3l3-9 4 18 3-9h5"
          stroke="#FBFCFD"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={length}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

export const SceneBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconIn = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const draw = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 22 } }), [0, 1], [16, 0]);
  const titleO = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });
  const tagO = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(spring({ frame: frame - 40, fps, config: { damping: 22 } }), [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * iconIn})`, opacity: iconIn }}>
          <PulseMark progress={draw} />
        </div>
        <div
          style={{
            opacity: titleO,
            transform: `translateY(${titleY}px)`,
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: -2.5,
            color: colors.fg,
            lineHeight: 1,
          }}
        >
          Clinic Copilot
        </div>
        <div
          style={{
            opacity: tagO,
            transform: `translateY(${tagY}px)`,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 4,
            color: colors.fgMuted,
            textTransform: "uppercase",
          }}
        >
          AI-triaged incoming cases
        </div>
      </div>
    </AbsoluteFill>
  );
};
