import { colors } from "../theme";

export const Logo = ({ size = 56, color = colors.ink }: { size?: number; color?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="2" y="2" width="52" height="52" rx="14" fill={colors.blue} />
      <path d="M28 14v28M14 28h28" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
    <span style={{ fontSize: size * 0.55, fontWeight: 700, color, letterSpacing: -1 }}>
      Clinic Copilot
    </span>
  </div>
);
