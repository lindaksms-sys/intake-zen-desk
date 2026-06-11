import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { colors } from "../theme";

// 15s @ 30fps = 450 frames
// Beat 1 (0-90):   Logo mark draw-in
// Beat 2 (60-180): "Clinic Copilot" wordmark settles, subtitle fades in
// Beat 3 (210-330): Wordmark scales/lifts to top; product UI reveals from below
// Beat 4 (330-450): UI breathes, subtle sheen, hold

const LogoMark: React.FC<{ progress: number }> = ({ progress }) => {
  // Plus / medical cross drawn with a soft pulse ring
  const ringScale = interpolate(progress, [0, 1], [0.6, 1]);
  const ringOpacity = interpolate(progress, [0, 0.6, 1], [0, 0.6, 0.9]);
  const crossScale = interpolate(progress, [0.2, 1], [0.4, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 9999,
          background: `radial-gradient(circle, ${colors.blueSoft} 0%, transparent 70%)`,
          transform: `scale(${ringScale})`, opacity: ringOpacity,
        }}
      />
      <div
        style={{
          position: "absolute", inset: 20, borderRadius: 28,
          background: `linear-gradient(135deg, ${colors.blue}, #2F7DEC)`,
          transform: `scale(${crossScale})`,
          boxShadow: `0 20px 50px -20px ${colors.blue}80`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Medical cross */}
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{ position: "absolute", left: "50%", top: 0, width: 14, height: "100%", marginLeft: -7, background: "#fff", borderRadius: 4 }} />
          <div style={{ position: "absolute", top: "50%", left: 0, height: 14, width: "100%", marginTop: -7, background: "#fff", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
};

const MockApp: React.FC<{ progress: number }> = ({ progress }) => {
  const y = interpolate(progress, [0, 1], [80, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const kpis = [
    { label: "New intakes", value: "24", tone: colors.blue, bg: colors.blueSoft },
    { label: "Urgent cases", value: "6", tone: colors.amber, bg: "#FEF3C7" },
    { label: "Booked consults", value: "18", tone: colors.teal, bg: "#CCFBF1" },
    { label: "Missed follow-ups", value: "3", tone: colors.red, bg: "#FEE2E2" },
    { label: "Inactive patients", value: "41", tone: colors.inkSoft, bg: "#E2E8F0" },
    { label: "Follow-up complete", value: "12", tone: colors.green, bg: "#D1FAE5" },
  ];
  return (
    <div
      style={{
        width: 1280, height: 720, borderRadius: 20,
        background: colors.surface, border: `1px solid ${colors.border}`,
        boxShadow: "0 40px 100px -30px rgba(11,27,43,0.25)",
        display: "flex", overflow: "hidden",
        transform: `translateY(${y}px)`, opacity,
      }}
    >
      {/* Sidebar */}
      <div style={{ width: 240, background: "#F9FAFC", borderRight: `1px solid ${colors.border}`, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.blue }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.ink }}>Clinic Copilot</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: colors.inkSoft, marginBottom: 10 }}>OPERATE</div>
        {["Overview", "Work Queue", "Patients", "Appointments", "Intake Queue"].map((s, i) => (
          <div key={s} style={{
            padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 4,
            color: i === 0 ? colors.blue : colors.ink,
            background: i === 0 ? colors.blueSoft : "transparent", fontWeight: i === 0 ? 600 : 500,
          }}>{s}</div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.ink, letterSpacing: -0.5 }}>Overview</div>
            <div style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4 }}>Today's intakes, urgent cases, and follow-ups.</div>
          </div>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: colors.teal, color: "#fff", fontSize: 13, fontWeight: 600 }}>
            Open Work Queue →
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {kpis.map((k, i) => {
            const cardP = Math.max(0, Math.min(1, progress * 1.4 - i * 0.06));
            return (
              <div key={k.label} style={{
                background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18,
                opacity: cardP, transform: `translateY(${(1 - cardP) * 12}px)`,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, marginBottom: 14 }} />
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.ink, letterSpacing: -0.5 }}>{k.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink, marginTop: 4 }}>{k.label}</div>
                <div style={{ fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>Updated just now</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1: logo
  const logoP = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  // Beat 2: wordmark + subtitle
  const wordP = spring({ frame: frame - 40, fps, config: { damping: 22, stiffness: 110 } });
  const subP = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 3: lift hero & reveal app
  const liftStart = 200, liftEnd = 270;
  const lift = interpolate(frame, [liftStart, liftEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const heroY = interpolate(lift, [0, 1], [0, -260]);
  const heroScale = interpolate(lift, [0, 1], [1, 0.55]);
  const heroOpacity = interpolate(frame, [liftStart, liftEnd + 40], [1, 0.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Beat 4: app reveal
  const appP = spring({ frame: frame - 240, fps, config: { damping: 22, stiffness: 80 } });

  // Subtle breathing on hold
  const breathe = Math.sin((frame - 330) / 24) * 4;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, ${colors.bg} 60%, #E9EFF6 100%)`,
    }}>
      {/* faint grid overlay */}
      <AbsoluteFill style={{
        backgroundImage:
          `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        opacity: 0.18,
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }} />

      {/* Hero stack — centered, then lifts */}
      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "center",
        transform: `translateY(${heroY}px) scale(${heroScale})`,
        opacity: heroOpacity,
      }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * logoP})`, opacity: logoP, marginBottom: 36 }}>
          <LogoMark progress={logoP} />
        </div>
        <div style={{
          fontSize: 96, fontWeight: 700, color: colors.ink, letterSpacing: -2.5, lineHeight: 1,
          opacity: wordP,
          transform: `translateY(${(1 - wordP) * 20}px)`,
          display: "flex", gap: 22,
        }}>
          <span>Clinic</span>
          <span style={{ color: colors.blue }}>Copilot</span>
        </div>
        <div style={{
          marginTop: 22, fontSize: 26, color: colors.inkSoft, fontWeight: 500, letterSpacing: 0.2,
          opacity: subP, transform: `translateY(${(1 - subP) * 10}px)`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: colors.teal, display: "inline-block" }} />
          AI triage for clinic intake
        </div>
      </AbsoluteFill>

      {/* Product UI reveal */}
      <Sequence from={220}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${80 + breathe}px)` }}>
          <MockApp progress={appP} />
        </AbsoluteFill>
      </Sequence>

      {/* Tiny wordmark settles top after the lift */}
      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "flex-start", paddingTop: 60,
        opacity: interpolate(frame, [liftEnd, liftEnd + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: colors.ink, fontWeight: 700 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: colors.blue }} />
          Clinic <span style={{ color: colors.blue }}>Copilot</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
