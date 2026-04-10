import React from "react";

export const tqColors = {
  background: "#000000",
  backgroundLight: "#0a0a12",
  foreground: "#e2e8f0",
  primary: "#00d4ff",
  primaryLight: "#38bdf8",
  primaryDark: "#0284c7",
  accent: "#a855f7",
  accentLight: "#c084fc",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  border: "#334155",
  success: "#22c55e",
  destructive: "#ef4444",
  warning: "#f59e0b",
  white: "#ffffff",
};

export const tqGlass: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
};

export const tqGlassStrong: React.CSSProperties = {
  ...tqGlass,
  background: "rgba(15, 23, 42, 0.85)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
};

export const tqGlow = (color: string, intensity = 1) => ({
  boxShadow: `0 0 ${20 * intensity}px ${color}40, 0 0 ${60 * intensity}px ${color}20`,
});

export const gridBackground: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
  `,
  backgroundSize: "60px 60px",
};
