import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const stats = [
  { value: "4.2x", label: "Compression", color: tqColors.primary },
  { value: "3-bit", label: "Per Value", color: tqColors.accent },
  { value: "0%", label: "Accuracy Loss", color: tqColors.success },
];

export const TurboQuantReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title spring: arrives around 0.3s
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
    delay: Math.round(0.3 * fps),
  });
  const titleScale = interpolate(titleProgress, [0, 1], [0.5, 1]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Glow pulse on the title
  const glowPulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.6, 1],
  );

  // Badge spring: arrives around 1.5s
  const badgeProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
  });
  const badgeY = interpolate(badgeProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        ...gridBackground,
        fontFamily: inter,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Radial glow accents */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "30%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primary}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.accent}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          fontSize: 130,
          fontFamily: montserrat,
          fontWeight: 900,
          lineHeight: 1.1,
          color: tqColors.primary,
          textShadow: `0 0 40px ${tqColors.primary}60`,
          filter: `drop-shadow(0 0 ${40 * glowPulse}px ${tqColors.primary}60) drop-shadow(0 0 ${80 * glowPulse}px ${tqColors.accent}30)`,
          textAlign: "center",
        }}
      >
        TurboQuant
      </div>

      {/* Badge */}
      <div
        style={{
          marginTop: 30,
          opacity: badgeProgress,
          transform: `translateY(${badgeY}px)`,
          ...tqGlass,
          borderRadius: 50,
          padding: "14px 40px",
          fontSize: 22,
          fontWeight: 600,
          color: tqColors.mutedForeground,
          letterSpacing: 2,
        }}
      >
        Google Research &bull; ICLR 2026
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 70,
        }}
      >
        {stats.map((stat, i) => {
          const cardProgress = spring({
            frame,
            fps,
            config: { damping: 12, stiffness: 120 },
            delay: Math.round((3 + i * 0.6) * fps),
          });
          const cardScale = interpolate(cardProgress, [0, 1], [0.5, 1]);
          const cardY = interpolate(cardProgress, [0, 1], [40, 0]);

          return (
            <div
              key={i}
              style={{
                ...tqGlass,
                opacity: cardProgress,
                transform: `translateY(${cardY}px) scale(${cardScale})`,
                borderTop: `4px solid ${stat.color}`,
                padding: "40px 50px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 220,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontFamily: montserrat,
                  fontWeight: 900,
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 20,
                  fontWeight: 600,
                  color: tqColors.mutedForeground,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
