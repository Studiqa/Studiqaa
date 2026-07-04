import type { ButtonHTMLAttributes, ReactNode } from "react";

// Minimal seed for the shared design-system package described in Section 17.3.
// Radius/spacing tokens follow Section 4.3 exactly so every app stays visually consistent.
export const tokens = {
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64],
  color: { bg: "#0B0D10", accent: "#5B5EF4", text: "#EDEDED" },
};

export function AppButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      style={{
        borderRadius: tokens.radius.md,
        padding: "10px 16px",
        background: tokens.color.accent,
        color: "#fff",
        border: "none",
        cursor: "pointer",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function AppCard({ children }: { children: ReactNode }) {
  return (
    <div style={{ borderRadius: tokens.radius.lg, padding: tokens.spacing[4], background: "#15181C" }}>
      {children}
    </div>
  );
}

export function StreakIndicator({ days }: { days: number }) {
  return <span aria-label={`${days} day streak`}>🔥 {days}</span>;
}
