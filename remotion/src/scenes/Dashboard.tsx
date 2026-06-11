import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

type Case = { name: string; symptom: string; urgency: "red" | "amber" | "green"; label: string };

// Sorted by urgency (final state)
const cases: Case[] = [
  { name: "Sarah Mitchell", symptom: "Severe chest pain, shortness of breath", urgency: "red", label: "NOW" },
  { name: "Aisha Patel", symptom: "High fever 39.5°C, persistent vomiting", urgency: "red", label: "NOW" },
  { name: "Tom Reynolds", symptom: "Migraine with vision changes", urgency: "amber", label: "TODAY" },
  { name: "Maria Lopez", symptom: "Recurring back pain, getting worse", urgency: "amber", label: "TODAY" },
  { name: "James Kim", symptom: "Sinus congestion, sore throat 3 days", urgency: "green", label: "ROUTINE" },
  { name: "Olivia Chen", symptom: "Annual check-up booking", urgency: "green", label: "ROUTINE" },
];

const colorFor = (u: Case["urgency"]) =>
  u === "red" ? colors.red : u === "amber" ? colors.amber : colors.green;

export const Dashboard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSp = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const assignSp = spring({ frame: frame - 220, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ padding: "80px 100px" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 36,
          opacity: headerSp,
          transform: `translateY(${(1 - headerSp) * 20}px)`,
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: colors.blue, fontWeight: 600, letterSpacing: 2 }}>
            TRIAGE QUEUE
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: colors.ink, letterSpacing: -2, marginTop: 6 }}>
            Today · 6 cases
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Urgent" value="2" color={colors.red} />
          <Stat label="Today" value="2" color={colors.amber} />
          <Stat label="Routine" value="2" color={colors.green} />
        </div>
      </div>

      {/* Case rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cases.map((c, i) => {
          const delay = 20 + i * 18;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90 } });
          const isFirst = i === 0;
          return (
            <div
              key={c.name}
              style={{
                background: colors.surface,
                borderRadius: 18,
                padding: "22px 28px",
                border: `1px solid ${colors.border}`,
                borderLeft: `6px solid ${colorFor(c.urgency)}`,
                boxShadow: "0 4px 16px rgba(11,27,43,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: sp,
                transform: `translateX(${(1 - sp) * -40}px)`,
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: colorFor(c.urgency),
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1,
                  minWidth: 90,
                  textAlign: "center",
                }}
              >
                {c.label}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.ink }}>{c.name}</div>
                <div style={{ fontSize: 18, color: colors.inkSoft, marginTop: 4 }}>{c.symptom}</div>
              </div>
              {isFirst ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: assignSp,
                    transform: `scale(${0.7 + assignSp * 0.3})`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      background: colors.blue,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    DR
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: colors.ink }}>Dr. Rivera</div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "10px 20px",
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 16,
                    color: colors.inkSoft,
                    fontWeight: 600,
                  }}
                >
                  Assign
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div
    style={{
      background: colors.surface,
      borderRadius: 14,
      padding: "16px 24px",
      border: `1px solid ${colors.border}`,
      textAlign: "center",
      minWidth: 110,
    }}
  >
    <div style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: -1 }}>{value}</div>
    <div style={{ fontSize: 13, color: colors.inkSoft, fontWeight: 500, letterSpacing: 1 }}>
      {label.toUpperCase()}
    </div>
  </div>
);
