import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const EMAIL = "dr.alvarez@northbay.health";
const PASSWORD = "••••••••••••";

const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 100 }}>
    <div
      style={{
        position: "absolute",
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(11,18,32,0.18)",
        transform: `translate(-50%, -50%) scale(${click})`,
        opacity: click,
      }}
    />
    <svg width="22" height="28" viewBox="0 0 22 28" style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))" }}>
      <path
        d="M2 2 L2 22 L7 17 L10 24 L13 23 L10 16 L17 16 Z"
        fill={colors.fg}
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const typeOut = (full: string, frame: number, startFrame: number, perChar = 2.6) => {
  const n = Math.max(0, Math.min(full.length, Math.floor((frame - startFrame) / perChar)));
  return full.slice(0, n);
};

export const SceneLogin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entry
  const cardSp = spring({ frame, fps, config: { damping: 24, stiffness: 110 } });
  const cardY = interpolate(cardSp, [0, 1], [24, 0]);

  // Typing schedule (frames)
  const emailStart = 50;
  const passStart = emailStart + EMAIL.length * 2.6 + 18;
  const buttonHover = passStart + PASSWORD.length * 2.6 + 14;
  const clickAt = buttonHover + 18;
  const successAt = clickAt + 22;

  const typedEmail = typeOut(EMAIL, frame, emailStart);
  const typedPass = typeOut(PASSWORD, frame, passStart);

  const emailFocus = interpolate(frame, [emailStart - 6, emailStart], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * interpolate(frame, [passStart - 6, passStart], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const passFocus = interpolate(frame, [passStart - 6, passStart], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * interpolate(frame, [buttonHover - 6, buttonHover], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cursor path
  const cursorX = interpolate(
    frame,
    [0, emailStart - 8, passStart - 8, buttonHover, clickAt],
    [1620, 1080, 1080, 1080, 1080],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [0, emailStart - 8, passStart - 8, buttonHover, clickAt],
    [220, 478, 580, 680, 680],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const click = interpolate(frame, [clickAt - 2, clickAt + 6], [0, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * interpolate(frame, [clickAt + 6, clickAt + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const buttonPress = interpolate(frame, [clickAt - 2, clickAt + 4, clickAt + 14], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const successSp = spring({ frame: frame - successAt, fps, config: { damping: 22 } });
  const successO = interpolate(successSp, [0, 1], [0, 1]);
  const cardFade = interpolate(frame, [successAt, successAt + 18], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${colors.bgSoft} 0%, ${colors.bg} 70%)`,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.18,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Sign-in card */}
      <div
        style={{
          width: 520,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "44px 48px",
          boxShadow: "0 40px 80px -30px rgba(11,18,32,0.22)",
          transform: `translateY(${cardY}px) scale(${0.96 + cardSp * 0.04})`,
          opacity: cardSp * cardFade,
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: colors.fg,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.fg, letterSpacing: -0.3 }}>
              Clinic Intake Copilot
            </div>
            <div style={{ fontSize: 12, color: colors.fgMuted, marginTop: 2 }}>Staff access only</div>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 600, color: colors.fg, marginBottom: 20 }}>Sign in</div>

        {/* Email field */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: colors.fgMuted, marginBottom: 8 }}>Email</div>
          <div
            style={{
              height: 42,
              borderRadius: 8,
              border: `1px solid ${interpolate(emailFocus, [0, 1], [0, 1]) > 0.4 ? colors.routine : colors.border}`,
              boxShadow: emailFocus > 0.4 ? `0 0 0 3px ${colors.routineSoft}` : "none",
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              color: colors.fg,
              background: colors.card,
            }}
          >
            {typedEmail}
            {emailFocus > 0.4 && typedEmail.length < EMAIL.length && (
              <span
                style={{
                  display: "inline-block",
                  width: 1.5,
                  height: 16,
                  background: colors.fg,
                  marginLeft: 2,
                  opacity: Math.floor(frame / 8) % 2 ? 0.9 : 0,
                }}
              />
            )}
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: colors.fgMuted, marginBottom: 8 }}>Password</div>
          <div
            style={{
              height: 42,
              borderRadius: 8,
              border: `1px solid ${passFocus > 0.4 ? colors.routine : colors.border}`,
              boxShadow: passFocus > 0.4 ? `0 0 0 3px ${colors.routineSoft}` : "none",
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              fontSize: 16,
              letterSpacing: 2,
              color: colors.fg,
              background: colors.card,
            }}
          >
            {typedPass}
          </div>
        </div>

        {/* Button */}
        <div
          style={{
            height: 44,
            borderRadius: 8,
            background: colors.fg,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            transform: `scale(${buttonPress})`,
            transition: "none",
          }}
        >
          {frame > successAt - 4 && frame < successAt + 30 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderTopColor: "#fff",
                  display: "inline-block",
                  animation: undefined,
                  transform: `rotate(${(frame * 18) % 360}deg)`,
                }}
              />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: colors.fgMuted, textAlign: "center" }}>
          Need an account? Sign up
        </div>
      </div>

      {/* Success card */}
      {successO > 0 && (
        <div
          style={{
            position: "absolute",
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: "28px 36px",
            boxShadow: "0 40px 80px -20px rgba(11,18,32,0.25)",
            opacity: successO,
            transform: `translateY(${interpolate(successO, [0, 1], [20, 0])}px) scale(${0.96 + successO * 0.04})`,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: colors.routineSoft,
              color: colors.routine,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.routine} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.fg }}>Welcome back, Dr. Alvarez</div>
            <div style={{ fontSize: 13, color: colors.fgMuted, marginTop: 2 }}>
              Redirecting to your dashboard…
            </div>
          </div>
        </div>
      )}

      <Cursor x={cursorX} y={cursorY} click={click} />
    </AbsoluteFill>
  );
};
