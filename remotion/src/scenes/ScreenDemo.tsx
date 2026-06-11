import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";

// 20s @ 30fps = 600 frames
// 0-120:    auth page enters
// 120-220:  type email
// 220-310:  type password
// 310-360:  cursor moves to button + click
// 360-420:  sign-in loading + crossfade
// 420-600:  dashboard reveal + KPI stagger

const EMAIL = "linda@clinic.health";
const PASSWORD = "••••••••••";

const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 50 }}>
    <div style={{
      position: "absolute", width: 40, height: 40, borderRadius: "50%",
      background: "rgba(15,118,110,0.25)", transform: `translate(-50%, -50%) scale(${click})`,
      opacity: click,
    }} />
    <svg width="22" height="28" viewBox="0 0 22 28" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}>
      <path d="M2 2 L2 22 L7 17 L10 24 L13 23 L10 16 L17 16 Z" fill="#0B1B2B" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </div>
);

const PulseIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const AuthPage: React.FC<{ emailText: string; passwordText: string; loading: boolean; opacity: number }> = ({ emailText, passwordText, loading, opacity }) => (
  <AbsoluteFill style={{
    background: "#fbfcfe",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Inter, sans-serif", opacity,
  }}>
    <div style={{ width: 460 }}>
      {/* Brand row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0B1B2B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PulseIcon />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#0B1B2B", letterSpacing: -0.3 }}>Clinic Intake Copilot</div>
          <div style={{ fontSize: 13, color: "#5A6B7B", marginTop: 2 }}>Staff access only</div>
        </div>
      </div>
      {/* Card */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 28,
        boxShadow: "0 4px 20px -10px rgba(11,27,43,0.08)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#0B1B2B", marginBottom: 22 }}>Sign in</div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#0B1B2B", marginBottom: 8 }}>Email</div>
          <div style={{
            height: 42, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff",
            padding: "0 14px", display: "flex", alignItems: "center", fontSize: 14, color: "#0B1B2B",
          }}>
            {emailText}
            {emailText.length < EMAIL.length && <span style={{ width: 1.5, height: 16, background: "#0B1B2B", marginLeft: 2, opacity: 0.8 }} />}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#0B1B2B", marginBottom: 8 }}>Password</div>
          <div style={{
            height: 42, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff",
            padding: "0 14px", display: "flex", alignItems: "center", fontSize: 16, color: "#0B1B2B", letterSpacing: 2,
          }}>
            {passwordText}
            {emailText === EMAIL && passwordText.length < PASSWORD.length && <span style={{ width: 1.5, height: 16, background: "#0B1B2B", marginLeft: 2, opacity: 0.8, letterSpacing: 0 }} />}
          </div>
        </div>

        <div style={{
          height: 44, borderRadius: 8, background: "#0B1B2B", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 500, gap: 10,
        }}>
          {loading && <div style={{
            width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff", animation: "none",
          }} />}
          {loading ? "Signing in…" : "Sign in"}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#5A6B7B" }}>
          Need an account? <span style={{ color: "#0F766E" }}>Sign up</span>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

const DashboardPage: React.FC<{ progress: number }> = ({ progress }) => {
  const navItems = ["Overview", "Work Queue", "Patients", "Appointments", "Intake Queue"];
  const kpis = [
    { label: "New intakes",        value: 24, sub: "Awaiting triage today",       bg: "#CCFBF1", fg: "#0F766E" },
    { label: "Urgent cases",       value: 6,  sub: "Emergency + urgent, open",   bg: "#FEF3C7", fg: "#B45309" },
    { label: "Booked consults",    value: 18, sub: "Assigned today",             bg: "#CCFBF1", fg: "#0F766E" },
    { label: "Missed follow-ups",  value: 3,  sub: "Open beyond 7 days",         bg: "#FFE4E6", fg: "#BE123C" },
    { label: "Inactive patients",  value: 41, sub: "No activity 30 days",        bg: "#E2E8F0", fg: "#475569" },
    { label: "Follow-up complete", value: 12, sub: "Closed today",               bg: "#D1FAE5", fg: "#047857" },
  ];

  return (
    <AbsoluteFill style={{
      background: "#F4F7FB", fontFamily: "Inter, sans-serif",
      opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
    }}>
      {/* Sidebar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 260,
        background: "#fff", borderRight: "1px solid #E2E8F0", padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0B1B2B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PulseIcon />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0B1B2B" }}>Clinic Copilot</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: "#5A6B7B", marginBottom: 10 }}>OPERATE</div>
        {navItems.map((s, i) => (
          <div key={s} style={{
            padding: "10px 12px", borderRadius: 8, fontSize: 14, marginBottom: 4,
            color: i === 0 ? "#0B1B2B" : "#0B1B2B",
            background: i === 0 ? "#F1F5F9" : "transparent",
            fontWeight: i === 0 ? 600 : 500,
          }}>{s}</div>
        ))}
      </div>

      {/* Top toolbar */}
      <div style={{
        position: "absolute", top: 0, left: 260, right: 0, height: 60,
        background: "#fff", borderBottom: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", padding: "0 28px", gap: 14,
      }}>
        <div style={{ flex: 1, maxWidth: 520, height: 36, borderRadius: 8, background: "#F1F5F9", padding: "0 14px", display: "flex", alignItems: "center", color: "#5A6B7B", fontSize: 13 }}>
          Search patients, episodes, tasks…
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0F766E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>LK</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0B1B2B" }}>Linda Kisimisi</div>
            <div style={{ fontSize: 11, color: "#5A6B7B" }}>linda@clinic.health</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ position: "absolute", top: 60, left: 260, right: 0, bottom: 0, padding: 40, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#0B1B2B", letterSpacing: -0.8, lineHeight: 1.1 }}>Overview</div>
            <div style={{ fontSize: 14, color: "#5A6B7B", marginTop: 6 }}>Today at a glance — new intakes, urgent cases, bookings, and follow-ups.</div>
          </div>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "#0F766E", color: "#fff", fontSize: 14, fontWeight: 500 }}>
            Open Work Queue →
          </div>
        </div>

        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {kpis.map((k, i) => {
            const p = Math.max(0, Math.min(1, (progress - 0.2) * 2 - i * 0.08));
            return (
              <div key={k.label} style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22,
                opacity: p, transform: `translateY(${(1 - p) * 16}px)`,
                boxShadow: "0 1px 2px rgba(11,27,43,0.04)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: k.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: k.fg, opacity: 0.85 }} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 600, color: "#0B1B2B", letterSpacing: -0.6 }}>{k.value}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0B1B2B", marginTop: 4 }}>{k.label}</div>
                <div style={{ fontSize: 12, color: "#5A6B7B", marginTop: 2 }}>{k.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ScreenDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Auth enter
  const authEnter = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });

  // Typing
  const emailStart = 120, emailEnd = 220;
  const emailChars = Math.floor(interpolate(frame, [emailStart, emailEnd], [0, EMAIL.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const emailText = EMAIL.slice(0, emailChars);

  const passStart = 230, passEnd = 310;
  const passChars = Math.floor(interpolate(frame, [passStart, passEnd], [0, PASSWORD.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const passwordText = PASSWORD.slice(0, passChars);

  // Loading + crossfade
  const loading = frame >= 350 && frame < 420;
  const authOpacity = interpolate(frame, [400, 440], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Dashboard reveal
  const dashProg = spring({ frame: frame - 400, fps, config: { damping: 24, stiffness: 70 } });

  // Cursor path (relative to 1920x1080 canvas, content centered around 460-wide card at center)
  // Card center ~ (960, 540); email field ~ (960, 488); password ~ (960, 580); button ~ (960, 660)
  const cx = 960, cy = 540;
  let cursorX = cx + 300, cursorY = cy + 260, click = 0;
  if (frame < 110) {
    // entering from bottom-right toward email
    const t = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    cursorX = interpolate(t, [0, 1], [1500, cx - 100]);
    cursorY = interpolate(t, [0, 1], [900, 488]);
  } else if (frame < 225) {
    cursorX = cx - 100; cursorY = 488;
    if (frame > 110 && frame < 125) click = interpolate(frame, [110, 120, 125], [0, 1, 0]);
  } else if (frame < 320) {
    const t = interpolate(frame, [225, 240], [0, 1], { extrapolateRight: "clamp" });
    cursorX = interpolate(t, [0, 1], [cx - 100, cx - 100]);
    cursorY = interpolate(t, [0, 1], [488, 580]);
    if (frame > 230 && frame < 245) click = interpolate(frame, [230, 238, 245], [0, 1, 0]);
  } else if (frame < 360) {
    const t = interpolate(frame, [320, 350], [0, 1], { extrapolateRight: "clamp" });
    cursorX = interpolate(t, [0, 1], [cx - 100, cx]);
    cursorY = interpolate(t, [0, 1], [580, 660]);
    if (frame > 350 && frame < 365) click = interpolate(frame, [350, 357, 365], [0, 1, 0]);
  } else {
    // fade cursor out
    cursorY = 660;
    cursorX = cx;
  }
  const cursorOpacity = interpolate(frame, [400, 420], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * authOpacity;

  return (
    <AbsoluteFill style={{ background: "#fbfcfe" }}>
      <div style={{ opacity: authEnter * authOpacity, width: "100%", height: "100%" }}>
        <AuthPage emailText={emailText} passwordText={passwordText} loading={loading} opacity={1} />
      </div>

      <Sequence from={400}>
        <DashboardPage progress={dashProg} />
      </Sequence>

      <div style={{ opacity: cursorOpacity }}>
        <Cursor x={cursorX} y={cursorY} click={click} />
      </div>
    </AbsoluteFill>
  );
};
