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
import { tqColors, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Staggered springs ---
  const line1Spring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });
  const line2Spring = spring({
    frame,
    fps,
    config: { damping: 180 },
    delay: Math.round(1.2 * fps),
  });
  const dividerSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2.5 * fps),
  });
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 180 },
    delay: Math.round(3.5 * fps),
  });
  const subscribeSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(5.0 * fps),
  });

  // --- Interpolated values ---
  const line1Y = interpolate(line1Spring, [0, 1], [30, 0]);
  const line2Y = interpolate(line2Spring, [0, 1], [30, 0]);
  const dividerWidth = interpolate(dividerSpring, [0, 1], [0, 400]);
  const logoY = interpolate(logoSpring, [0, 1], [20, 0]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.8, 1]);
  const subscribeY = interpolate(subscribeSpring, [0, 1], [15, 0]);

  // Pulsing glow for TurboQuant logo
  const pulse = interpolate(
    frame % Math.round(2 * fps),
    [0, Math.round(fps), Math.round(2 * fps)],
    [0.5, 1, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 600px 400px at 50% 45%, ${tqColors.primary}18 0%, transparent 70%)`,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          ...gridBackground,
          position: "absolute",
          inset: 0,
          opacity: 0.4,
        }}
      />

      {/* Content stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            opacity: line1Spring,
            transform: `translateY(${line1Y}px)`,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: 56,
              color: tqColors.foreground,
            }}
          >
            The Era of Context Limits
          </span>
        </div>

        {/* Line 2 */}
        <div
          style={{
            opacity: line2Spring,
            transform: `translateY(${line2Y}px)`,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: 72,
              color: tqColors.primary,
            }}
          >
            Is Officially Ending.
          </span>
        </div>

        {/* Horizontal divider */}
        <div
          style={{
            width: dividerWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${tqColors.primary}, transparent)`,
            opacity: dividerSpring,
            marginBottom: 36,
          }}
        />

        {/* TurboQuant logo text */}
        <div
          style={{
            opacity: logoSpring,
            transform: `translateY(${logoY}px) scale(${logoScale})`,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: 52,
              color: tqColors.primary,
              filter: `drop-shadow(0 0 ${interpolate(pulse, [0.5, 1], [8, 24])}px ${tqColors.primary}80)`,
            }}
          >
            TurboQuant
          </span>
        </div>

        {/* Subscribe text */}
        <div
          style={{
            opacity: subscribeSpring,
            transform: `translateY(${subscribeY}px)`,
          }}
        >
          <span
            style={{
              fontFamily: inter,
              fontWeight: 500,
              fontSize: 20,
              color: tqColors.mutedForeground,
            }}
          >
            Like &amp; Subscribe for more AI breakthroughs
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
