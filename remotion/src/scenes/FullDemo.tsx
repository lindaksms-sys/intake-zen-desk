import {
  AbsoluteFill,
  Series,
  Video,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const CARD = 45; // 1.5s
const SEGMENTS = [
  { src: "intro.mp4", frames: 600, label: "Intro", step: 1, title: "Clinic Copilot" },
  { src: "signin.mp4", frames: 600, label: "Sign in", step: 2, title: "Sign in" },
  { src: "intake.mp4", frames: 900, label: "Submit intake", step: 3, title: "Submit intake" },
  { src: "agent.mp4", frames: 600, label: "AI agent triage", step: 4, title: "AI agent triage" },
  { src: "result.mp4", frames: 750, label: "Case routed", step: 5, title: "Case routed" },
] as const;

export const FULL_DEMO_DURATION =
  SEGMENTS.reduce((sum, s) => sum + s.frames, 0) + CARD * (SEGMENTS.length - 1);

function TitleCard({ step, title }: { step: number; title: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [CARD - 10, CARD], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = enter * exit;
  const y = interpolate(enter, [0, 1], [12, 0]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgSoft} 100%)`,
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          opacity: o,
          transform: `translateY(${y}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            fontWeight: 600,
            color: colors.fgMuted,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Step {step}
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 700,
            color: colors.fg,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 32,
            width: 64,
            height: 4,
            borderRadius: 2,
            background: colors.fg,
            marginInline: "auto",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

function LowerThird({ step, label, segmentFrames }: { step: number; label: string; segmentFrames: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [segmentFrames - 20, segmentFrames - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = enter * exit;
  const x = interpolate(enter, [0, 1], [-16, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        bottom: 48,
        opacity: o,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderRadius: 999,
        background: "rgba(11,18,32,0.72)",
        backdropFilter: "none",
        fontFamily,
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.14)",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        STEP {step}
      </span>
      <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.2 }}>{label}</span>
    </div>
  );
}

function Segment({ src, frames, step, label }: { src: string; frames: number; step: number; label: string }) {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Video src={staticFile(`clips/${src}`)} muted />
      <LowerThird step={step} label={label} segmentFrames={frames} />
    </AbsoluteFill>
  );
}

export const FullDemo = () => {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Series>
        {SEGMENTS.flatMap((seg, i) => {
          const items = [
            <Series.Sequence key={`seg-${i}`} durationInFrames={seg.frames}>
              <Segment src={seg.src} frames={seg.frames} step={seg.step} label={seg.label} />
            </Series.Sequence>,
          ];
          if (i < SEGMENTS.length - 1) {
            const next = SEGMENTS[i + 1];
            items.push(
              <Series.Sequence key={`card-${i}`} durationInFrames={CARD}>
                <TitleCard step={next.step} title={next.title} />
              </Series.Sequence>
            );
          }
          return items;
        })}
      </Series>
    </AbsoluteFill>
  );
};
