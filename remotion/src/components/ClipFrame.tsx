import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

type Props = {
  step: number;
  total?: number;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  /** Frames before the step pill / title pop in. Default 0. */
  introDelay?: number;
};

/**
 * Consistent wrapper around every clip. Renders the scene full-bleed, then
 * overlays a small brand badge (top-left), a step pill (bottom-left), and
 * a one-line scene title (bottom-right) so the clips read as a series.
 */
export const ClipFrame: React.FC<Props> = ({
  step,
  total = 8,
  eyebrow,
  title,
  children,
  introDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame: frame - introDelay, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 18;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = enter * exit;

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily }}>
      {children}

      {/* Brand badge — top-left */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: o,
          transform: `translateY(${interpolate(enter, [0, 1], [-8, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
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
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.fg, letterSpacing: -0.2 }}>
          Clinic Intake Copilot
        </span>
      </div>

      {/* Step pill — bottom-left */}
      <div
        style={{
          position: "absolute",
          left: 40,
          bottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(11,18,32,0.82)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          opacity: o,
          transform: `translateX(${interpolate(enter, [0, 1], [-12, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.6,
            padding: "3px 7px",
            borderRadius: 5,
            background: "rgba(255,255,255,0.16)",
          }}
        >
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
          {eyebrow}
        </span>
      </div>

      {/* Title — bottom-right */}
      <div
        style={{
          position: "absolute",
          right: 44,
          bottom: 40,
          fontSize: 16,
          fontWeight: 500,
          color: colors.fgMuted,
          opacity: o,
          letterSpacing: -0.1,
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};
