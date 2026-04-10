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
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const PolarQuantExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Title spring (0.2s) ---
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.2 * fps),
  });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // --- Morph progress (3s, damping 30, stiffness 60) ---
  const morphProgress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 60 },
    delay: Math.round(3 * fps),
  });

  // --- Radar sweep (starts at 5s, 90 frames duration) ---
  const radarDelay = Math.round(5 * fps);
  const radarAngle =
    frame > radarDelay
      ? interpolate(frame - radarDelay, [0, 90], [0, 360], {
          extrapolateRight: "clamp",
        })
      : 0;
  const radarX = 350 + 240 * Math.cos((radarAngle * Math.PI) / 180);
  const radarY = 250 + 240 * Math.sin((radarAngle * Math.PI) / 180);
  const radarOpacity = interpolate(morphProgress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Badge spring (7s) ---
  const badgeProgress = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    delay: Math.round(7 * fps),
  });
  const badgeScale = interpolate(badgeProgress, [0, 1], [0.5, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [30, 0]);

  // --- Cartesian grid lines ---
  const cartesianLineCount = 7;
  const cartesianVLines = Array.from({ length: cartesianLineCount }, (_, i) => {
    const x = (700 / (cartesianLineCount + 1)) * (i + 1);
    return { x1: x, y1: 0, x2: x, y2: 500 };
  });
  const cartesianHLines = Array.from({ length: cartesianLineCount }, (_, i) => {
    const y = (500 / (cartesianLineCount + 1)) * (i + 1);
    return { x1: 0, y1: y, x2: 700, y2: y };
  });

  // --- Polar circles ---
  const polarRadii = [40, 80, 120, 160, 200, 240];
  const polarAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const polarCx = 350;
  const polarCy = 250;

  // --- Label crossfade ---
  const cartesianLabelOpacity = interpolate(morphProgress, [0, 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const polarLabelOpacity = interpolate(morphProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Radar trail wedge path ---
  const trailSpan = 40; // degrees behind the sweep line
  const trailStartAngle = radarAngle - trailSpan;
  const trailStartRad = (trailStartAngle * Math.PI) / 180;
  const trailEndRad = (radarAngle * Math.PI) / 180;
  const trailX1 = polarCx + 240 * Math.cos(trailStartRad);
  const trailY1 = polarCy + 240 * Math.sin(trailStartRad);
  const trailX2 = polarCx + 240 * Math.cos(trailEndRad);
  const trailY2 = polarCy + 240 * Math.sin(trailEndRad);
  const largeArc = trailSpan > 180 ? 1 : 0;
  const trailPath = `M ${polarCx} ${polarCy} L ${trailX1} ${trailY1} A 240 240 0 ${largeArc} 1 ${trailX2} ${trailY2} Z`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        ...gridBackground,
        fontFamily: inter,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        padding: "40px 60px",
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontFamily: montserrat,
            fontWeight: 900,
            color: tqColors.primary,
          }}
        >
          Stage 1: PolarQuant
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: tqColors.mutedForeground,
            marginTop: 6,
            letterSpacing: 1,
          }}
        >
          The Metadata Tax Killer
        </div>
      </div>

      {/* Large SVG Canvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          width: "100%",
        }}
      >
        <svg
          width={800}
          height={570}
          viewBox="0 0 700 500"
          style={{ overflow: "visible" }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Group 1: Cartesian Grid */}
          <g
            opacity={interpolate(morphProgress, [0, 1], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
            filter="url(#glow)"
          >
            {/* Vertical lines */}
            {cartesianVLines.map((line, i) => {
              const lineProgress = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: Math.round((0.5 + i * 0.08) * fps),
              });
              return (
                <line
                  key={`v-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={interpolate(lineProgress, [0, 1], [0, line.y2])}
                  stroke={tqColors.primary}
                  strokeWidth={1.5}
                  opacity={0.6 * lineProgress}
                />
              );
            })}
            {/* Horizontal lines */}
            {cartesianHLines.map((line, i) => {
              const lineProgress = spring({
                frame,
                fps,
                config: { damping: 200 },
                delay: Math.round((0.8 + i * 0.08) * fps),
              });
              return (
                <line
                  key={`h-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={interpolate(lineProgress, [0, 1], [0, line.x2])}
                  y2={line.y2}
                  stroke={tqColors.primary}
                  strokeWidth={1.5}
                  opacity={0.6 * lineProgress}
                />
              );
            })}
          </g>

          {/* Group 2: Polar Grid */}
          <g
            opacity={interpolate(morphProgress, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
            filter="url(#glow)"
          >
            {/* Concentric circles */}
            {polarRadii.map((r, i) => (
              <circle
                key={`circle-${i}`}
                cx={polarCx}
                cy={polarCy}
                r={r}
                fill="none"
                stroke={tqColors.accent}
                strokeWidth={1.5}
                opacity={0.5}
              />
            ))}
            {/* Radial lines */}
            {polarAngles.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const endX = polarCx + 240 * Math.cos(rad);
              const endY = polarCy + 240 * Math.sin(rad);
              return (
                <line
                  key={`radial-${i}`}
                  x1={polarCx}
                  y1={polarCy}
                  x2={endX}
                  y2={endY}
                  stroke={tqColors.accent}
                  strokeWidth={1}
                  opacity={0.35}
                />
              );
            })}
          </g>

          {/* Radar sweep (visible after morph completes) */}
          {radarOpacity > 0 && radarAngle > 0 && (
            <g opacity={radarOpacity}>
              {/* Trail wedge */}
              <path
                d={trailPath}
                fill={tqColors.primary}
                opacity={0.08}
              />
              {/* Sweep line */}
              <line
                x1={polarCx}
                y1={polarCy}
                x2={radarX}
                y2={radarY}
                stroke={tqColors.primary}
                strokeWidth={2}
                filter="url(#glowStrong)"
              />
              {/* Sweep dot at tip */}
              <circle
                cx={radarX}
                cy={radarY}
                r={4}
                fill={tqColors.primary}
                filter="url(#glowStrong)"
              />
            </g>
          )}

          {/* Labels below grid */}
          <text
            x={350}
            y={490}
            textAnchor="middle"
            fontFamily={inter}
            fontSize={18}
            fontWeight={600}
            fill={tqColors.mutedForeground}
            opacity={cartesianLabelOpacity}
          >
            Cartesian (x, y, z)
          </text>
          <text
            x={350}
            y={490}
            textAnchor="middle"
            fontFamily={inter}
            fontSize={18}
            fontWeight={600}
            fill={tqColors.accentLight}
            opacity={polarLabelOpacity}
          >
            {"Polar (r, \u03B8)"}
          </text>
        </svg>
      </div>

      {/* Step pills row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 4,
          marginBottom: 12,
        }}
      >
        {[
          "1. Random Rotation",
          "2. Polar Coordinates",
          "3. Uniform Angles",
          "4. No Metadata",
        ].map((step, i) => {
          const pillProgress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: Math.round((4 + i * 0.4) * fps),
          });
          return (
            <div
              key={i}
              style={{
                opacity: pillProgress,
                transform: `translateY(${interpolate(pillProgress, [0, 1], [12, 0])}px)`,
                padding: "8px 18px",
                borderRadius: 20,
                background: `${tqColors.accent}20`,
                border: `1px solid ${tqColors.accent}40`,
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.accentLight,
              }}
            >
              {step}
            </div>
          );
        })}
      </div>

      {/* Bottom badge: Metadata Tax = 0 */}
      <div
        style={{
          opacity: badgeProgress,
          transform: `translateY(${badgeY}px) scale(${badgeScale})`,
          ...tqGlass,
          borderRadius: 20,
          padding: "18px 44px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          border: `2px solid ${tqColors.success}50`,
          marginTop: 4,
        }}
      >
        {/* Checkmark SVG */}
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="17"
            fill={`${tqColors.success}25`}
            stroke={tqColors.success}
            strokeWidth="2"
          />
          <path
            d="M10 18 L16 24 L26 12"
            fill="none"
            stroke={tqColors.success}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={40}
            strokeDashoffset={interpolate(badgeProgress, [0, 1], [40, 0])}
          />
        </svg>
        <div
          style={{
            fontSize: 30,
            fontFamily: montserrat,
            fontWeight: 900,
            color: tqColors.success,
          }}
        >
          Metadata Tax = 0
        </div>
      </div>
    </AbsoluteFill>
  );
};
