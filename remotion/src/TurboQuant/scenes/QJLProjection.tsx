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

// Scattered error points in high-dimensional space (shown as 2D scatter)
const errorPoints = [
  { x: 0.15, y: 0.72 }, { x: 0.82, y: 0.28 }, { x: 0.44, y: 0.91 },
  { x: 0.67, y: 0.13 }, { x: 0.23, y: 0.55 }, { x: 0.91, y: 0.68 },
  { x: 0.38, y: 0.35 }, { x: 0.56, y: 0.82 }, { x: 0.74, y: 0.47 },
  { x: 0.11, y: 0.19 }, { x: 0.88, y: 0.85 }, { x: 0.32, y: 0.63 },
  { x: 0.59, y: 0.08 }, { x: 0.47, y: 0.52 }, { x: 0.76, y: 0.71 },
  { x: 0.21, y: 0.88 }, { x: 0.63, y: 0.39 }, { x: 0.09, y: 0.42 },
];

// Each point collapses to either +1 or -1 (above/below center line)
const bitValues = errorPoints.map((p) => (p.y > 0.5 ? 1 : -1));

export const QJLProjection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Error cloud appears (0-1.5s)
  const pointSprings = errorPoints.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 100 },
      delay: Math.round(0.5 * fps) + i * 2,
    }),
  );

  // Phase 2: Projection — points collapse to center line (2.5-4s)
  const projectSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 50 },
    delay: Math.round(2.5 * fps),
  });

  // Phase 3: Squash to single bit — points snap to +1 or -1 lanes (4.5-5.5s)
  const squashSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
    delay: Math.round(4.5 * fps),
  });

  // Phase 4: Bit labels appear (5.5s)
  const bitLabelSprings = errorPoints.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 120 },
      delay: Math.round(5.5 * fps) + i * 2,
    }),
  );

  // Phase labels
  const label1Spring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) });
  const label2Spring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.3 * fps) });
  const label3Spring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.3 * fps) });

  // Final output row
  const outputSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(7.0 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.0 * fps),
  });

  // SVG dimensions
  const SVG_W = 700;
  const SVG_H = 420;
  const PAD = 40;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          gap: 16,
        }}
      >
        {/* Phase labels — top */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 8,
          }}
        >
          {[
            { label: "Residual Errors", spring: label1Spring, color: tqColors.destructive, active: projectSpring < 0.3 },
            { label: "Project to Lower Dim", spring: label2Spring, color: tqColors.accent, active: projectSpring > 0.3 && squashSpring < 0.3 },
            { label: "Squash to 1 Bit", spring: label3Spring, color: tqColors.success, active: squashSpring > 0.3 },
          ].map((phase, i) => (
            <div
              key={i}
              style={{
                opacity: phase.spring,
                padding: "6px 18px",
                borderRadius: 8,
                backgroundColor: phase.active ? `${phase.color}20` : tqColors.muted,
                border: `1.5px solid ${phase.active ? phase.color : tqColors.border}50`,
                fontSize: 13,
                fontWeight: 700,
                color: phase.active ? phase.color : tqColors.mutedForeground,
                fontFamily: inter,
              }}
            >
              {phase.label}
            </div>
          ))}
        </div>

        {/* Main SVG visualization */}
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Center line (the projection target) — appears in phase 2 */}
          <line
            x1={PAD}
            y1={SVG_H / 2}
            x2={SVG_W - PAD}
            y2={SVG_H / 2}
            stroke={tqColors.border}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={interpolate(projectSpring, [0, 0.3], [0, 0.6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />

          {/* +1 / -1 lane labels — appear in phase 3 */}
          <text
            x={SVG_W - PAD + 16}
            y={SVG_H * 0.25}
            fill={tqColors.success}
            fontSize={18}
            fontFamily={montserrat}
            fontWeight={900}
            opacity={squashSpring}
          >
            +1
          </text>
          <text
            x={SVG_W - PAD + 16}
            y={SVG_H * 0.75}
            fill={tqColors.accent}
            fontSize={18}
            fontFamily={montserrat}
            fontWeight={900}
            opacity={squashSpring}
          >
            -1
          </text>

          {/* +1 lane line */}
          <line
            x1={PAD}
            y1={SVG_H * 0.25}
            x2={SVG_W - PAD}
            y2={SVG_H * 0.25}
            stroke={tqColors.success}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={interpolate(squashSpring, [0, 0.5], [0, 0.3], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
          {/* -1 lane line */}
          <line
            x1={PAD}
            y1={SVG_H * 0.75}
            x2={SVG_W - PAD}
            y2={SVG_H * 0.75}
            stroke={tqColors.accent}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={interpolate(squashSpring, [0, 0.5], [0, 0.3], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />

          {/* Error points — animate through 3 phases */}
          {errorPoints.map((pt, i) => {
            const s = pointSprings[i];
            const bit = bitValues[i];

            // Original position (scattered)
            const origX = PAD + pt.x * (SVG_W - 2 * PAD);
            const origY = PAD + pt.y * (SVG_H - 2 * PAD);

            // Projected position (collapse Y toward center, spread X evenly)
            const projX = PAD + ((i + 0.5) / errorPoints.length) * (SVG_W - 2 * PAD);
            const projY = SVG_H / 2 + (pt.y - 0.5) * 40; // slight Y spread around center

            // Squashed position (+1 or -1 lane)
            const squashY = bit === 1 ? SVG_H * 0.25 : SVG_H * 0.75;

            // Interpolate through phases
            const currentY = interpolate(squashSpring, [0, 1], [
              interpolate(projectSpring, [0, 1], [origY, projY]),
              squashY,
            ]);
            const finalX = interpolate(projectSpring, [0, 1], [origX, projX]);

            // Color shifts: red → purple → green/purple based on bit
            const pointColor = squashSpring > 0.5
              ? (bit === 1 ? tqColors.success : tqColors.accent)
              : projectSpring > 0.5
                ? tqColors.accent
                : tqColors.destructive;

            const radius = squashSpring > 0.5 ? 7 : 5;
            const bitLabel = bitLabelSprings[i];

            return (
              <g key={i}>
                <circle
                  cx={finalX}
                  cy={currentY}
                  r={radius}
                  fill={pointColor}
                  opacity={s}
                  filter="url(#pointGlow)"
                />
                {/* Bit label on each point */}
                {squashSpring > 0.5 && (
                  <text
                    x={finalX}
                    y={currentY - 12}
                    textAnchor="middle"
                    fill={pointColor}
                    fontSize={11}
                    fontFamily="'SF Mono', 'Fira Code', monospace"
                    fontWeight={700}
                    opacity={bitLabel}
                  >
                    {bit === 1 ? "+1" : "-1"}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Output row — the final bit string */}
        <div
          style={{
            opacity: outputSpring,
            transform: `scale(${interpolate(outputSpring, [0, 1], [0.5, 1])}) translateY(${interpolate(outputSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                marginRight: 4,
              }}
            >
              Output:
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {bitValues.map((bit, i) => {
                const bitS = bitLabelSprings[i];
                return (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 24,
                      borderRadius: 4,
                      backgroundColor: bit === 1 ? `${tqColors.success}18` : `${tqColors.accent}18`,
                      border: `1px solid ${bit === 1 ? tqColors.success : tqColors.accent}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: bit === 1 ? tqColors.success : tqColors.accentLight,
                      opacity: bitS,
                      transform: `scale(${interpolate(bitS, [0, 1], [0.3, 1])})`,
                    }}
                  >
                    {bit === 1 ? "+1" : "-1"}
                  </div>
                );
              })}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: tqColors.mutedForeground,
                marginLeft: 8,
              }}
            >
              1 bit per value
            </span>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          transform: `translateY(${interpolate(bottomSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: tqColors.mutedForeground }}>
          Every error reduced to a single sign bit.{" "}
          <span style={{ color: tqColors.success, fontWeight: 700 }}>
            Mathematically unbiased.
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
