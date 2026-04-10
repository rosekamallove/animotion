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
  weights: ["400", "600"],
  subsets: ["latin"],
});

const helpdesks = [
  { name: "Zendesk", color: "#03363d", bg: "#03363d15" },
  { name: "Intercom", color: "#286efa", bg: "#286efa15" },
  { name: "Freshdesk", color: "#0ea5e9", bg: "#0ea5e915" },
  { name: "HubSpot", color: "#ff7a59", bg: "#ff7a5915" },
  { name: "Drift", color: "#6b48ff", bg: "#6b48ff15" },
  { name: "Crisp", color: "#5c47f5", bg: "#5c47f515" },
];

export const HelpdeskLogos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });

  // Circular layout rotation
  const rotation = interpolate(frame, [0, 300], [0, 360]);
  const radius = 280;
  const centerX = 960;
  const centerY = 520;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily: inter, overflow: "hidden" }}>
      {/* Decorative rings */}
      {[360, 300, 240].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            left: centerX - size / 2,
            top: centerY - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `1px solid ${colors.border}`,
            opacity: 0.5 - i * 0.15,
          }}
        />
      ))}

      {/* Center - Helply logo */}
      <div
        style={{
          position: "absolute",
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 32px ${colors.primary}30`,
          zIndex: 10,
        }}
      >
        <span style={{ color: "white", fontSize: 42, fontWeight: 700, fontFamily: montserrat }}>H</span>
      </div>

      {/* Orbiting logos */}
      {helpdesks.map((desk, i) => {
        const angle = (i / helpdesks.length) * 360 + rotation;
        const rad = (angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * radius - 60;
        const y = centerY + Math.sin(rad) * radius - 28;

        const entryProgress = spring({
          frame,
          fps,
          config: { damping: 15 },
          delay: Math.round(i * 0.1 * fps),
        });

        // Connecting line
        const lineOpacity = interpolate(entryProgress, [0, 1], [0, 0.2]);

        return (
          <React.Fragment key={desk.name}>
            {/* Connector line */}
            <svg
              style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
            >
              <line
                x1={centerX}
                y1={centerY}
                x2={x + 60}
                y2={y + 28}
                stroke={colors.primary}
                strokeWidth={1.5}
                opacity={lineOpacity}
                strokeDasharray="6 4"
              />
            </svg>

            {/* Logo card */}
            <div
              style={{
                ...glass,
                position: "absolute",
                left: x,
                top: y,
                padding: "12px 24px",
                opacity: entryProgress,
                transform: `scale(${entryProgress})`,
                zIndex: 5,
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: desk.color }}>
                {desk.name}
              </span>
            </div>
          </React.Fragment>
        );
      })}

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <span style={{ fontFamily: montserrat, fontSize: 40, fontWeight: 900, color: colors.foreground }}>
          Auto-syncs with your existing helpdesk
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleProgress,
        }}
      >
        <span style={{ fontSize: 18, color: colors.mutedForeground }}>
          Plug in and go. No migration needed.
        </span>
      </div>
    </AbsoluteFill>
  );
};
