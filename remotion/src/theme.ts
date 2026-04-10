import React from "react";

export const colors = {
  background: "#ffffff",
  foreground: "#0f172a",
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  primaryDark: "#1d4ed8",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  success: "#22c55e",
  destructive: "#ef4444",
  purple: "#7c3aed",
};

export const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
};

export const glassStrong: React.CSSProperties = {
  ...glass,
  background: "rgba(255, 255, 255, 0.85)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
};
