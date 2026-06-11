import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const teal = "#0F766E";
const tealSoft = "#E6F4F1";
const amberSoft = "#FEF3E2";
const amberIcon = "#D97706";
const rose = "#E11D48";
const roseSoft = "#FEE7EC";
const greenSoft = "#E7F6EE";
const greenIcon = "#059669";

type Kpi = {
  icon: string;
  value: string;
  label: string;
  sub: string;
  tint: string;
  iconColor: string;
};

const kpis: Kpi[] = [
  { icon: "📥", value: "4", label: "New intakes", sub: "awaiting triage", tint: tealSoft, iconColor: teal },
  { icon: "⚠", value: "9", label: "Urgent cases", sub: "high or critical", tint: amberSoft, iconColor: amberIcon },
  { icon: "📅", value: "7", label: "Booked consults", sub: "this period", tint: tealSoft, iconColor: teal },
  { icon: "🗓", value: "2", label: "Missed follow-ups", sub: "needs recovery", tint: roseSoft, iconColor: rose },
  { icon: "👤", value: "0", label: "Inactive patients", sub: "30+ days quiet", tint: "#F1F5F9", iconColor: "#475569" },
  { icon: "✓", value: "0", label: "Follow-up complete", sub: "tasks closed", tint: greenSoft, iconColor: greenIcon },
];

const navItems = [
  { icon: "▦", label: "Overview", active: true },
  { icon: "≡", label: "Work Queue" },
  { icon: "◉", label: "Patients" },
  { icon: "▤", label: "Appointments" },
  { icon: "☎", label: "Intake Queue" },
  { icon: "↗", label: "Open Public Intake Form" },
];

const configItems = [
  { icon: "⇄", label: "Pathways" },
  { icon: "✦", label: "Campaigns" },
  { icon: "▥", label: "Reporting" },
  { icon: "⚙", label: "Settings" },
];

export const Dashboard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSp = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: "#F8FAFC", padding: 40 }}>
      <div
        style={{
          flex: 1,
          background: "#fff",
          borderRadius: 24,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 12px 40px rgba(11,27,43,0.06)",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 280,
            background: "#fff",
            borderRight: `1px solid ${colors.border}`,
            padding: "28px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 22px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#0B1B2B",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              ✚
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.ink, letterSpacing: -0.3 }}>
                HerFlow <span style={{ color: teal }}>AI</span>
              </div>
              <div style={{ fontSize: 9, color: colors.inkSoft, fontWeight: 600, letterSpacing: 1.5 }}>
                CARE COORDINATION
              </div>
            </div>
          </div>

          <SectionLabel>OPERATE</SectionLabel>
          {navItems.map((n) => (
            <NavRow key={n.label} {...n} />
          ))}

          <div style={{ height: 18 }} />
          <SectionLabel>CONFIGURE</SectionLabel>
          {configItems.map((n) => (
            <NavRow key={n.label} {...n} />
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 32px",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#F1F5F9",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 14,
                color: "#94A3B8",
              }}
            >
              ⌕  Search patients, episodes, tasks…
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 18, color: colors.inkSoft }}>🔔</div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: tealSoft,
                  color: teal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                LK
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>Linda Kisimisi</div>
                <div style={{ fontSize: 11, color: colors.inkSoft }}>info@creativehauz.space</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              padding: "32px 40px",
              opacity: headerSp,
              transform: `translateY(${(1 - headerSp) * 16}px)`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: colors.ink,
                    letterSpacing: -1.2,
                    margin: 0,
                  }}
                >
                  Overview
                </h1>
                <div style={{ fontSize: 15, color: colors.inkSoft, marginTop: 6 }}>
                  Today at a glance — new intakes, urgent cases, bookings, and follow-ups.
                </div>
              </div>
              <div
                style={{
                  background: teal,
                  color: "#fff",
                  padding: "12px 22px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: `0 6px 20px ${teal}33`,
                }}
              >
                Open Work Queue  →
              </div>
            </div>

            {/* KPI grid */}
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 16,
              }}
            >
              {kpis.map((k, i) => {
                const sp = spring({
                  frame: frame - 10 - i * 7,
                  fps,
                  config: { damping: 18, stiffness: 110 },
                });
                return (
                  <div
                    key={k.label}
                    style={{
                      background: "#fff",
                      border: `1px solid ${colors.border}`,
                      borderRadius: 16,
                      padding: "20px 18px",
                      boxShadow: "0 2px 8px rgba(11,27,43,0.03)",
                      opacity: sp,
                      transform: `translateY(${(1 - sp) * 18}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: k.tint,
                        color: k.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        marginBottom: 18,
                      }}
                    >
                      {k.icon}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: colors.ink, letterSpacing: -1 }}>
                      {k.value}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 6 }}>
                      {k.label}
                    </div>
                    <div style={{ fontSize: 11, color: colors.inkSoft, marginTop: 3 }}>{k.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Intake activity heading */}
            <div style={{ marginTop: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.inkSoft, letterSpacing: 2 }}>
                INTAKE ACTIVITY
              </div>
              <div style={{ fontSize: 13, color: colors.inkSoft, marginTop: 4 }}>
                Voice and web submissions arriving today
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: colors.inkSoft,
      letterSpacing: 2,
      padding: "4px 12px 6px",
    }}
  >
    {children}
  </div>
);

const NavRow = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: 10,
      background: active ? "#0B1B2B" : "transparent",
      color: active ? "#fff" : colors.ink,
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    <span style={{ fontSize: 14, width: 18, color: active ? teal : colors.inkSoft }}>{icon}</span>
    {label}
  </div>
);
