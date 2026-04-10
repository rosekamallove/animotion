import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors, glass } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const missingArticles = [
  { topic: "How to change user roles", queries: 47, severity: "high" },
  { topic: "API rate limit errors", queries: 34, severity: "high" },
  { topic: "SSO setup with Okta", queries: 28, severity: "medium" },
  { topic: "Webhook configuration", queries: 22, severity: "medium" },
  { topic: "Export data to CSV", queries: 18, severity: "low" },
];

const barData = [
  { label: "Mon", value: 85 },
  { label: "Tue", value: 92 },
  { label: "Wed", value: 78 },
  { label: "Thu", value: 95 },
  { label: "Fri", value: 88 },
];

export const GapFinder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const dashboardProgress = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.5 * fps) });
  const subtitleProgress = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.5 * fps) });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily: inter, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🔍
          </div>
          <span style={{ fontFamily: montserrat, fontSize: 44, fontWeight: 900, color: colors.foreground }}>
            Gap Finder
          </span>
        </div>
        <div style={{ fontSize: 18, color: colors.mutedForeground, marginTop: 8 }}>
          Learns from customer interactions and fills knowledge gaps
        </div>
      </div>

      {/* Dashboard content */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 60,
          right: 60,
          bottom: 100,
          display: "flex",
          gap: 24,
          opacity: dashboardProgress,
          transform: `translateY(${interpolate(dashboardProgress, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Bar chart */}
        <div style={{ ...glass, background: "rgba(255,255,255,0.9)", flex: 1, padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.foreground, marginBottom: 24 }}>
            Resolution Coverage
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 240, paddingTop: 20 }}>
            {barData.map((bar, i) => {
              const barProgress = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: Math.round(0.8 * fps) + i * 4,
              });
              const height = interpolate(barProgress, [0, 1], [0, bar.value * 2.2]);

              return (
                <div
                  key={bar.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>
                    {bar.value}%
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height,
                      borderRadius: "8px 8px 4px 4px",
                      background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                    }}
                  />
                  <span style={{ fontSize: 12, color: colors.mutedForeground }}>{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing articles list */}
        <div style={{ ...glass, background: "rgba(255,255,255,0.9)", flex: 1, padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.foreground, marginBottom: 16 }}>
            Missing Articles
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missingArticles.map((article, i) => {
              const itemProgress = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: Math.round(1.0 * fps) + i * 5,
              });
              const severityColor =
                article.severity === "high"
                  ? colors.destructive
                  : article.severity === "medium"
                    ? "#f59e0b"
                    : colors.mutedForeground;

              return (
                <div
                  key={article.topic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    backgroundColor: colors.muted,
                    opacity: itemProgress,
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: severityColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: colors.foreground, flex: 1 }}>
                    {article.topic}
                  </span>
                  <span style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {article.queries} queries
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: subtitleProgress,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 600, color: colors.primary }}>
          Reveals real questions that aren't covered in your docs
        </span>
      </div>
    </AbsoluteFill>
  );
};
