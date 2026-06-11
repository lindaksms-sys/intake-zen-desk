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

const CARD = 36; // 1.2s
// frames = trimmed render duration at 30fps; endAt = source frame to stop at
const SEGMENTS = [
  { src: "intro.mp4",  frames: 210, endAt: 210, step: 1, title: "Clinic Copilot",   eyebrow: "Welcome",     label: "Intro" },
  { src: "signin.mp4", frames: 270, endAt: 270, step: 2, title: "Sign in",          eyebrow: "Step 1",      label: "Sign in" },
  { src: "intake.mp4", frames: 420, endAt: 420, step: 3, title: "Submit intake",    eyebrow: "Step 2",      label: "Submit intake" },
  { src: "agent.mp4",  frames: 300, endAt: 300, step: 4, title: "AI agent triage",  eyebrow: "Step 3",      label: "AI agent triage" },
  { src: "result.mp4", frames: 330, endAt: 330, step: 5, title: "Case routed",      eyebrow: "Result",      label: "Case routed" },
] as const;

export const FULL_DEMO_DURATION =
  SEGMENTS.reduce((sum, s) => sum + s.frames, 0) + CARD * (SEGMENTS.length - 1);

function TitleCard({ eyebrow, title }: { eyebrow: string; title: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [CARD - 8, CARD], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = enter * exit;
  const y = interpolate(enter, [0, 1], [16, 0]);
  const lineW = interpolate(enter, [0, 1], [0, 96]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 40%, ${colors.bgSoft} 0%, ${colors.bg} 60%, #EAEEF4 100%)`,
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <div style={{ opacity: o, transform: `translateY(${y}px)`, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 13,
            letterSpacing: 4,
            fontWeight: 700,
            color: colors.routine,
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 999,
            background: colors.routineSoft,
            marginBottom: 28,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: colors.fg,
            letterSpacing: -2.5,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 28,
            width: lineW,
            height: 4,
            borderRadius: 2,
            background: colors.routine,
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
  const exit = interpolate(frame, [segmentFrames - 18, segmentFrames - 4], [1, 0], {
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
        background: "rgba(11,18,32,0.78)",
        fontFamily,
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.16)",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        STEP {step}
      </span>
      <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0.2 }}>{label}</span>
    </div>
  );
}

function Segment({ src, frames, endAt, step, label }: { src: string; frames: number; endAt: number; step: number; label: string }) {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Video src={staticFile(`clips/${src}`)} muted endAt={endAt} />
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
              <Segment src={seg.src} frames={seg.frames} endAt={seg.endAt} step={seg.step} label={seg.label} />
            </Series.Sequence>,
          ];
          if (i < SEGMENTS.length - 1) {
            const next = SEGMENTS[i + 1];
            items.push(
              <Series.Sequence key={`card-${i}`} durationInFrames={CARD}>
                <TitleCard eyebrow={next.eyebrow} title={next.title} />
              </Series.Sequence>
            );
          }
          return items;
        })}
      </Series>
    </AbsoluteFill>
  );
};
