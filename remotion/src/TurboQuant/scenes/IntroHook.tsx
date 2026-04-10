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

const NUM_PARTICLES = 24;

const particles = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 91.3) % 100,
  size: 2 + (i % 4) * 1.5,
  speed: 0.4 + (i % 5) * 0.15,
  phase: (i * 1.7) % (2 * Math.PI),
}));

export const IntroHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered animations
  const fourXPop = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    delay: 0,
  });
  const contextWindow = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.8 * fps),
  });
  const turboQuant = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    delay: Math.round(2.0 * fps),
  });
  const subtitle = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.0 * fps),
  });

  const fourXScale = interpolate(fourXPop, [0, 1], [0.2, 1]);
  const fourXGlow = interpolate(fourXPop, [0, 1], [0, 40]);
  const contextY = interpolate(contextWindow, [0, 1], [30, 0]);
  const turboScale = interpolate(turboQuant, [0, 1], [0.6, 1]);
  const turboY = interpolate(turboQuant, [0, 1], [40, 0]);
  const subtitleY = interpolate(subtitle, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...gridBackground,
        }}
      />

      {/* Background accent circles */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primary}10 0%, transparent 70%)`,
          top: -150,
          right: -100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.accent}08 0%, transparent 70%)`,
          bottom: -100,
          left: -80,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primaryDark}0a 0%, transparent 70%)`,
          top: "40%",
          left: "60%",
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => {
        const offsetX = Math.sin(frame * 0.02 * p.speed + p.phase) * 12;
        const offsetY =
          Math.sin(frame * 0.015 * p.speed + p.phase + 1.5) * 10;
        const particleOpacity = interpolate(
          Math.sin(frame * 0.03 * p.speed + p.phase),
          [-1, 1],
          [0.15, 0.5],
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor:
                i % 2 === 0 ? tqColors.primary : tqColors.accent,
              opacity: particleOpacity,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
          />
        );
      })}

      {/* Main content */}
      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Big 4X */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 260,
            fontWeight: 900,
            color: tqColors.primary,
            lineHeight: 1,
            opacity: fourXPop,
            transform: `scale(${fourXScale})`,
            textShadow: `0 0 ${fourXGlow}px ${tqColors.primary}80, 0 0 ${fourXGlow * 2}px ${tqColors.primary}30, 0 8px 40px ${tqColors.primary}20`,
          }}
        >
          4X
        </div>

        {/* Your Context Window */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 48,
            fontWeight: 700,
            color: tqColors.foreground,
            opacity: contextWindow,
            transform: `translateY(${contextY}px)`,
            marginTop: 8,
            letterSpacing: "0.02em",
          }}
        >
          Your Context Window
        </div>

        {/* TurboQuant title */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.1,
            opacity: turboQuant,
            transform: `scale(${turboScale}) translateY(${turboY}px)`,
            marginTop: 56,
            color: tqColors.primary,
            letterSpacing: "-0.02em",
          }}
        >
          TurboQuant
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 500,
            color: tqColors.mutedForeground,
            opacity: subtitle,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 20,
          }}
        >
          A Compression Breakthrough from Google Research
        </div>
      </div>
    </AbsoluteFill>
  );
};
