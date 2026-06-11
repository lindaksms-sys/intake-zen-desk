import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";

// 30s @ 30fps = 900 frames
// 0-50:    page enters
// 50-100:  type name
// 100-150: type age
// 150-180: pick channel (WhatsApp)
// 180-240: type phone number
// 240-270: click Continue -> Step 2
// 270-330: pick reason (Gynae)
// 330-410: tick symptoms (Bleeding, Pelvic pain)
// 410-460: pick duration / severity
// 460-560: type details
// 560-590: click Continue -> Step 3
// 590-660: review shown
// 660-700: tick consent
// 700-740: click submit
// 740-820: sending spinner
// 820-900: success card

const NAME = "Maria Rodriguez";
const AGE = "34";
const PHONE = "+254 712 408 559";
const DETAILS = "Heavier bleeding than usual for 3 days, mild pelvic cramps. No fever.";

// App tokens (mirror of src/styles.css)
const BG = "#FBFCFD";
const FG = "#0B1220";
const MUTED = "#5B6573";
const BORDER = "#E5E9F0";
const CARD = "#FFFFFF";
const DESTRUCTIVE = "#D94A3D";
const DESTRUCTIVE_SOFT = "#FBE9E7";
const MUTED_BG = "#F4F6F9";

const Caret: React.FC<{ frame: number }> = ({ frame }) => (
  <span style={{
    display: "inline-block", width: 1.5, height: 14, background: FG, marginLeft: 1,
    verticalAlign: "middle", opacity: Math.floor(frame / 8) % 2 ? 0.9 : 0,
  }} />
);

const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 100 }}>
    <div style={{
      position: "absolute", width: 44, height: 44, borderRadius: "50%",
      background: "rgba(11,18,32,0.18)",
      transform: `translate(-50%, -50%) scale(${click})`, opacity: click,
    }} />
    <svg width="22" height="28" viewBox="0 0 22 28" style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))" }}>
      <path d="M2 2 L2 22 L7 17 L10 24 L13 23 L10 16 L17 16 Z"
        fill={FG} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </div>
);

const HeartPulse: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 12h3l2-5 4 10 2-5h6" />
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" opacity="0.25"/>
  </svg>
);

const Alert: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckCircle: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={FG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Spinner: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "none" }}>
    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" />
    <path d="M12 3 a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Header: React.FC = () => (
  <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%", background: FG, color: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <HeartPulse />
    </div>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: FG }}>Clinic Intake</div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Secure patient request</div>
    </div>
  </header>
);

const Stepper: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const items = [{ n: 1, label: "Contact" }, { n: 2, label: "Reason" }, { n: 3, label: "Review" }];
  return (
    <ol style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, listStyle: "none", padding: 0 }}>
      {items.map((it, i) => {
        const active = step === it.n; const done = step > it.n;
        return (
          <li key={it.n} style={{ display: "flex", flex: 1, alignItems: "center", gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 500,
              border: `1px solid ${done || active ? FG : BORDER}`,
              background: done ? FG : BG,
              color: done ? BG : active ? FG : MUTED,
            }}>{done ? <CheckIcon size={11} /> : it.n}</div>
            <span style={{ fontSize: 12, fontWeight: active ? 500 : 400, color: active ? FG : MUTED }}>
              {it.label}
            </span>
            {i < items.length - 1 && <div style={{ marginLeft: 4, height: 1, flex: 1, background: BORDER }} />}
          </li>
        );
      })}
    </ol>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 500, color: FG, marginBottom: 8 }}>{children}</div>
);

const Field: React.FC<{ children?: React.ReactNode; placeholder?: string; height?: number }> = ({
  children, placeholder, height = 40,
}) => (
  <div style={{
    height, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD,
    padding: "0 14px", display: "flex", alignItems: "center", fontSize: 14, color: FG,
  }}>
    {children || <span style={{ color: MUTED }}>{placeholder}</span>}
  </div>
);

const Btn: React.FC<{
  children: React.ReactNode; variant?: "solid" | "ghost"; disabled?: boolean;
}> = ({ children, variant = "solid", disabled }) => (
  <div style={{
    height: 38, padding: "0 16px", borderRadius: 8, display: "inline-flex",
    alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 500,
    background: variant === "solid" ? FG : "transparent",
    color: variant === "solid" ? BG : FG,
    opacity: disabled ? 0.45 : 1,
  }}>{children}</div>
);

const Chip: React.FC<{ active?: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <div style={{
    padding: "8px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
    border: `1px solid ${active ? FG : BORDER}`,
    background: active ? FG : CARD, color: active ? BG : FG,
  }}>{children}</div>
);

const Checkbox: React.FC<{ checked?: boolean }> = ({ checked }) => (
  <div style={{
    width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? FG : BORDER}`,
    background: checked ? FG : CARD, display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>{checked && <CheckIcon size={10} />}</div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    marginTop: 24, borderRadius: 14, border: `1px solid ${BORDER}`, background: CARD,
    padding: 28, boxShadow: "0 1px 2px rgba(11,18,32,0.04)",
  }}>{children}</div>
);

// ---------- Steps ----------

const StepContact: React.FC<{ name: string; age: string; channel: string; contact: string; frame: number; cursorOnAge: boolean; cursorOnContact: boolean; cursorOnName: boolean }> =
({ name, age, channel, contact, frame, cursorOnName, cursorOnAge, cursorOnContact }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <div>
      <Label>Full name</Label>
      <Field placeholder="Maria Rodriguez">
        {name}{cursorOnName && name.length < NAME.length && <Caret frame={frame} />}
      </Field>
    </div>
    <div>
      <Label>Age or date of birth</Label>
      <Field placeholder="34 or 1991-04-12">
        {age}{cursorOnAge && age.length < AGE.length && <Caret frame={frame} />}
      </Field>
    </div>
    <div>
      <Label>Preferred contact</Label>
      <div style={{ display: "flex", gap: 8 }}>
        {["Chat", "Phone", "WhatsApp"].map((c) => (
          <Chip key={c} active={channel === c}>{c}</Chip>
        ))}
      </div>
    </div>
    <div>
      <Label>{channel === "WhatsApp" ? "WhatsApp number" : "Phone or email"}</Label>
      <Field placeholder="+254 7…">
        {contact}{cursorOnContact && contact.length < PHONE.length && <Caret frame={frame} />}
      </Field>
    </div>
  </div>
);

const StepReason: React.FC<{
  category: string; symptoms: string[]; duration: string; severity: string; details: string; frame: number; cursorOnDetails: boolean;
}> = ({ category, symptoms, duration, severity, details, frame, cursorOnDetails }) => {
  const reasons = [
    { v: "Pregnancy", hint: "Prenatal, postpartum" },
    { v: "Gynae symptoms", hint: "Bleeding, pain, discharge" },
    { v: "Family planning", hint: "Contraception, methods" },
    { v: "Administrative", hint: "Appointments, billing" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <Label>What is this about?</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {reasons.map((r) => {
            const active = category === r.v;
            return (
              <div key={r.v} style={{
                borderRadius: 10, border: `1px solid ${active ? FG : BORDER}`,
                background: active ? MUTED_BG : CARD, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: FG }}>{r.v}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{r.hint}</div>
              </div>
            );
          })}
        </div>
      </div>

      {category === "Gynae symptoms" && (
        <>
          <div>
            <Label>Symptoms</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Bleeding", "Discharge", "Pelvic pain", "Missed period", "Urinary symptoms"].map((s) => (
                <Chip key={s} active={symptoms.includes(s)}>{s}</Chip>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>How long?</Label>
              <Field>{duration || <span style={{ color: MUTED }}>e.g. 3 days</span>}</Field>
            </div>
            <div>
              <Label>Severity</Label>
              <div style={{ display: "flex", gap: 6 }}>
                {["Mild", "Moderate", "Severe"].map((s) => (
                  <Chip key={s} active={severity === s}>{s}</Chip>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label>Tell us more</Label>
            <div style={{
              minHeight: 90, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD,
              padding: "12px 14px", fontSize: 14, color: FG, lineHeight: 1.5,
            }}>
              {details}{cursorOnDetails && details.length < DETAILS.length && <Caret frame={frame} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StepReview: React.FC<{ consent: boolean; isUrgent: boolean }> = ({ consent, isUrgent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {isUrgent && (
      <div style={{
        display: "flex", gap: 10, padding: "10px 14px", borderRadius: 8,
        background: DESTRUCTIVE_SOFT, border: `1px solid ${DESTRUCTIVE}33`,
      }}>
        <div style={{ color: DESTRUCTIVE, marginTop: 1 }}><Alert /></div>
        <div style={{ fontSize: 11, color: DESTRUCTIVE, lineHeight: 1.5 }}>
          This may need urgent medical review. The clinic will be alerted.
        </div>
      </div>
    )}
    <div style={{ borderRadius: 10, border: `1px solid ${BORDER}`, padding: 16, background: MUTED_BG }}>
      <Row k="Name" v={NAME} />
      <Row k="Age" v={AGE} />
      <Row k="Contact" v={`WhatsApp · ${PHONE}`} />
      <Row k="Reason" v="Gynae symptoms" />
      <Row k="Symptoms" v="Bleeding, Pelvic pain" />
      <Row k="Duration" v="3 days" />
      <Row k="Severity" v="Moderate" last />
    </div>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ marginTop: 2 }}><Checkbox checked={consent} /></div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
        I consent to share these details with the clinic care team for triage and follow-up.
      </div>
    </div>
  </div>
);

const Row: React.FC<{ k: string; v: string; last?: boolean }> = ({ k, v, last }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", gap: 16,
    padding: "8px 0", borderBottom: last ? "none" : `1px solid ${BORDER}`,
  }}>
    <span style={{ fontSize: 12, color: MUTED }}>{k}</span>
    <span style={{ fontSize: 12, color: FG, fontWeight: 500, textAlign: "right" }}>{v}</span>
  </div>
);

const SuccessCard: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{
    marginTop: 24, borderRadius: 14, border: `1px solid ${BORDER}`, background: CARD,
    padding: 28, opacity: progress, transform: `translateY(${(1 - progress) * 12}px)`,
    boxShadow: "0 1px 2px rgba(11,18,32,0.04)",
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: "50%", background: MUTED_BG,
      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
    }}>
      <CheckCircle size={28} />
    </div>
    <div style={{ fontSize: 22, fontWeight: 600, color: FG, letterSpacing: -0.4 }}>
      Request received
    </div>
    <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.55 }}>
      A nurse will review your request shortly and follow up via WhatsApp.
    </div>
    <div style={{
      marginTop: 18, padding: "14px 16px", borderRadius: 10, background: MUTED_BG,
      border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <RowMuted k="Reference" v="INT-7042" />
      <RowMuted k="Urgency" v="Urgent — same day" highlight />
      <RowMuted k="Routed to" v="Nurse review" />
    </div>
  </div>
);

const RowMuted: React.FC<{ k: string; v: string; highlight?: boolean }> = ({ k, v, highlight }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
    <span style={{ color: MUTED }}>{k}</span>
    <span style={{ color: highlight ? DESTRUCTIVE : FG, fontWeight: 500 }}>{v}</span>
  </div>
);

// ---------- Main ----------

export const IntakeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // page enter
  const pageEnter = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });

  // Step 1 typing
  const nameChars = Math.floor(interpolate(frame, [50, 100], [0, NAME.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const ageChars  = Math.floor(interpolate(frame, [100, 150], [0, AGE.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const channel   = frame >= 170 ? "WhatsApp" : "";
  const contactChars = Math.floor(interpolate(frame, [180, 240], [0, PHONE.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Step transition
  const step: 1 | 2 | 3 = frame < 270 ? 1 : frame < 590 ? 2 : 3;

  // Step 2 state
  const category = frame >= 295 ? "Gynae symptoms" : "";
  const symptoms: string[] = [];
  if (frame >= 340) symptoms.push("Bleeding");
  if (frame >= 380) symptoms.push("Pelvic pain");
  const duration = frame >= 425 ? "3 days" : "";
  const severity = frame >= 450 ? "Moderate" : "";
  const detailsChars = Math.floor(interpolate(frame, [475, 555], [0, DETAILS.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Step 3
  const consent = frame >= 675;
  const submitting = frame >= 720 && frame < 820;
  const success = frame >= 820;
  const isUrgent = true;

  // Card layout — single centered column, max width 560 (mirrors max-w-xl)
  const CARD_W = 560;
  const CANVAS_W = 1920;
  const cardLeft = (CANVAS_W - CARD_W) / 2;

  // Cursor path (approximate to elements)
  const headerY = 80;
  const cardTop = 240;
  const fieldX = cardLeft + 280;

  // Compute cursor target by frame
  let cx = cardLeft + CARD_W / 2, cy = cardTop + 200, click = 0;
  const setClick = (start: number) => {
    if (frame > start && frame < start + 14) click = interpolate(frame, [start, start + 7, start + 14], [0, 1, 0]);
  };
  if (frame < 50) {
    const t = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    cx = interpolate(t, [0, 1], [CANVAS_W - 200, fieldX]);
    cy = interpolate(t, [0, 1], [900, cardTop + 100]);
  } else if (frame < 100) {
    cx = fieldX; cy = cardTop + 100; // name field
  } else if (frame < 150) {
    cx = fieldX; cy = cardTop + 180; // age field
    setClick(95);
  } else if (frame < 180) {
    cx = cardLeft + CARD_W - 100; cy = cardTop + 268; // WhatsApp chip
    setClick(168);
  } else if (frame < 240) {
    cx = fieldX; cy = cardTop + 348; // contact field
    setClick(178);
  } else if (frame < 270) {
    // move to Continue button (right)
    const t = interpolate(frame, [240, 265], [0, 1], { extrapolateRight: "clamp" });
    cx = interpolate(t, [0, 1], [fieldX, cardLeft + CARD_W - 60]);
    cy = interpolate(t, [0, 1], [cardTop + 348, cardTop + 470]);
    setClick(260);
  } else if (frame < 410) {
    // choosing reason and symptoms area
    if (frame < 320) { cx = cardLeft + 200; cy = cardTop + 160; setClick(290); }
    else if (frame < 360) { cx = cardLeft + 120; cy = cardTop + 280; setClick(335); } // Bleeding chip
    else { cx = cardLeft + 260; cy = cardTop + 280; setClick(375); }                  // Pelvic pain chip
  } else if (frame < 475) {
    if (frame < 445) { cx = cardLeft + 380; cy = cardTop + 380; setClick(445); } // severity
    else { cx = cardLeft + 280; cy = cardTop + 480; setClick(470); }            // details
  } else if (frame < 590) {
    if (frame < 555) { cx = cardLeft + 280; cy = cardTop + 480; }
    else { // move to Continue
      const t = interpolate(frame, [555, 580], [0, 1], { extrapolateRight: "clamp" });
      cx = interpolate(t, [0, 1], [cardLeft + 280, cardLeft + CARD_W - 60]);
      cy = interpolate(t, [0, 1], [cardTop + 480, cardTop + 600]);
      setClick(578);
    }
  } else if (frame < 700) {
    // consent checkbox
    cx = cardLeft + 30; cy = cardTop + 420;
    setClick(670);
  } else if (frame < 740) {
    // submit
    const t = interpolate(frame, [700, 730], [0, 1], { extrapolateRight: "clamp" });
    cx = interpolate(t, [0, 1], [cardLeft + 30, cardLeft + CARD_W - 80]);
    cy = interpolate(t, [0, 1], [cardTop + 420, cardTop + 530]);
    setClick(728);
  } else {
    cy = cardTop + 530; cx = cardLeft + CARD_W - 80;
  }
  const cursorOpacity = interpolate(frame, [800, 830], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Form opacity / step swap
  const formOpacity = success
    ? interpolate(frame, [780, 830], [1, 0], { extrapolateRight: "clamp" })
    : 1;
  const successProgress = spring({ frame: frame - 820, fps, config: { damping: 22, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{
        position: "absolute", left: cardLeft, top: 80, width: CARD_W,
        opacity: pageEnter, transform: `translateY(${(1 - pageEnter) * 14}px)`,
      }}>
        <Header />

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: FG, letterSpacing: -0.5 }}>
            {success ? "Request received" : "Tell us what is going on"}
          </div>
          {!success && (
            <div style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.55 }}>
              A nurse will review your request and follow up. Please share a few details
              so we can help you faster.
            </div>
          )}
        </div>

        {!success && (
          <div style={{
            marginTop: 20, padding: "10px 14px", borderRadius: 8,
            background: MUTED_BG, border: `1px solid ${BORDER}`,
            display: "flex", gap: 10,
          }}>
            <div style={{ marginTop: 1 }}><Alert /></div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.55 }}>
              If you have severe bleeding, chest pain, or trouble breathing, seek urgent care immediately.
            </div>
          </div>
        )}

        <div style={{ opacity: formOpacity }}>
          {!success && (
            <Card>
              <Stepper step={step} />
              {step === 1 && (
                <StepContact
                  frame={frame}
                  name={NAME.slice(0, nameChars)}
                  age={AGE.slice(0, ageChars)}
                  channel={channel}
                  contact={PHONE.slice(0, contactChars)}
                  cursorOnName={frame < 100}
                  cursorOnAge={frame >= 100 && frame < 150}
                  cursorOnContact={frame >= 180 && frame < 240}
                />
              )}
              {step === 2 && (
                <StepReason
                  frame={frame}
                  category={category}
                  symptoms={symptoms}
                  duration={duration}
                  severity={severity}
                  details={DETAILS.slice(0, detailsChars)}
                  cursorOnDetails={frame >= 475 && frame < 555}
                />
              )}
              {step === 3 && (
                <StepReview consent={consent} isUrgent={isUrgent} />
              )}

              <div style={{
                marginTop: 24, display: "flex", alignItems: "center",
                justifyContent: step === 1 ? "flex-end" : "space-between", gap: 12,
              }}>
                {step > 1 && <Btn variant="ghost">← Back</Btn>}
                {step < 3 ? (
                  <Btn>Continue →</Btn>
                ) : (
                  <Btn disabled={!consent && !submitting}>
                    {submitting ? <><Spinner /> Sending…</> : <><CheckIcon size={13} /> Review & submit</>}
                  </Btn>
                )}
              </div>
            </Card>
          )}
        </div>

        {success && <SuccessCard progress={successProgress} />}
      </div>

      <div style={{ opacity: cursorOpacity }}>
        <Cursor x={cx} y={cy} click={click} />
      </div>
    </AbsoluteFill>
  );
};
