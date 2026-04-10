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

loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Data points: [contextLength (K), memoryGB]
const dataPoints: [number, number][] = [
  [1, 0.15],
  [4, 0.6],
  [8, 1.2],
  [16, 2.5],
  [32, 5],
  [64, 10],
  [128, 20],
];

const milestones = [
  { idx: 2, label: "8K = 1.2 GB", color: tqColors.success },
  { idx: 4, label: "32K = 5 GB", color: tqColors.warning },
  { idx: 6, label: "128K = 20 GB", color: tqColors.destructive },
];

// Chart dimensions within SVG
const CHART_LEFT = 90;
const CHART_RIGHT = 680;
const CHART_TOP = 30;
const CHART_BOTTOM = 320;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const CHART_H = CHART_BOTTOM - CHART_TOP;

const MAX_X = 128; // max context in K
const MAX_Y = 22; // max memory in GB

const toSvgX = (contextK: number) =>
  CHART_LEFT + (contextK / MAX_X) * CHART_W;
const toSvgY = (memGB: number) =>
  CHART_BOTTOM - (memGB / MAX_Y) * CHART_H;

// Build SVG polyline points
const linePoints = dataPoints.map(
  ([k, gb]) => `${toSvgX(k)},${toSvgY(gb)}`,
);
const linePath = linePoints.join(" ");

// Build fill polygon (closed to x-axis)
const fillPoints = [
  `${toSvgX(dataPoints[0][0])},${CHART_BOTTOM}`,
  ...linePoints,
  `${toSvgX(dataPoints[dataPoints.length - 1][0])},${CHART_BOTTOM}`,
].join(" ");

// Total path length (approximate for dashoffset)
let totalLength = 0;
for (let i = 1; i < dataPoints.length; i++) {
  const dx = toSvgX(dataPoints[i][0]) - toSvgX(dataPoints[i - 1][0]);
  const dy = toSvgY(dataPoints[i][1]) - toSvgY(dataPoints[i - 1][1]);
  totalLength += Math.sqrt(dx * dx + dy * dy);
}

const xTicks = [1, 8, 32, 64, 128];
const yTicks = [0, 5, 10, 15, 20];

export const KVCacheGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Axes appear
  const axesSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.2 * fps),
  });

  // Line draws from frame 30 to 165
  const lineStart = Math.round(1.0 * fps);
  const lineEnd = Math.round(5.5 * fps);
  const lineProgress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOffset = totalLength * (1 - lineProgress);

  // Current position on line for glowing dot
  const currentIdx = interpolate(lineProgress, [0, 1], [0, dataPoints.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floorIdx = Math.floor(currentIdx);
  const ceilIdx = Math.min(floorIdx + 1, dataPoints.length - 1);
  const t = currentIdx - floorIdx;
  const dotX = interpolate(t, [0, 1], [
    toSvgX(dataPoints[floorIdx][0]),
    toSvgX(dataPoints[ceilIdx][0]),
  ]);
  const dotY = interpolate(t, [0, 1], [
    toSvgY(dataPoints[floorIdx][1]),
    toSvgY(dataPoints[ceilIdx][1]),
  ]);

  // Line color hue (green→yellow→red)
  const lineHue = interpolate(lineProgress, [0, 0.4, 0.8], [120, 45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Milestone callouts
  const milestone1 = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(2.5 * fps),
  });
  const milestone2 = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(3.8 * fps),
  });
  const milestone3 = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(5.3 * fps),
  });
  const milestoneSprings = [milestone1, milestone2, milestone3];

  // Live counters
  const currentContextK = interpolate(lineProgress, [0, 1], [1, 128], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentMemory = interpolate(lineProgress, [0, 1], [0.15, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter card
  const counterSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.5 * fps),
  });

  // Formula appears
  const formulaSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(5.8 * fps),
  });

  // Pulsing glow for final milestone
  const redPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.4, 1],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      {/* Live counter card — top right */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          opacity: counterSpring,
          transform: `translateY(${interpolate(counterSpring, [0, 1], [20, 0])}px)`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            ...tqGlass,
            padding: "16px 28px",
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: tqColors.foreground,
              }}
            >
              {currentContextK >= 1000
                ? `${(currentContextK / 1000).toFixed(0)}M`
                : currentContextK >= 10
                  ? `${Math.round(currentContextK)}K`
                  : `${currentContextK.toFixed(1)}K`}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Tokens
            </div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: tqColors.border }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: `hsl(${lineHue}, 80%, 55%)`,
              }}
            >
              {currentMemory.toFixed(1)} GB
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              VRAM
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG chart */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 60,
          right: 60,
          bottom: 80,
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 780 370"
          width="100%"
          height="100%"
          style={{ overflow: "hidden" }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`hsl(${lineHue}, 80%, 55%)`} stopOpacity={0.2} />
              <stop offset="100%" stopColor={`hsl(${lineHue}, 80%, 55%)`} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Y-axis */}
          <line
            x1={CHART_LEFT}
            y1={CHART_TOP}
            x2={CHART_LEFT}
            y2={CHART_BOTTOM}
            stroke={tqColors.border}
            strokeWidth={1.5}
            opacity={axesSpring}
          />
          {/* X-axis */}
          <line
            x1={CHART_LEFT}
            y1={CHART_BOTTOM}
            x2={CHART_RIGHT}
            y2={CHART_BOTTOM}
            stroke={tqColors.border}
            strokeWidth={1.5}
            opacity={axesSpring}
          />

          {/* Y grid lines + labels */}
          {yTicks.map((gb, i) => {
            const y = toSvgY(gb);
            const tickSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: Math.round(0.3 * fps) + i * 3,
            });
            return (
              <g key={`y-${gb}`} opacity={tickSpring}>
                <line
                  x1={CHART_LEFT}
                  y1={y}
                  x2={CHART_RIGHT}
                  y2={y}
                  stroke={tqColors.border}
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  opacity={0.3}
                />
                <text
                  x={CHART_LEFT - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill={tqColors.mutedForeground}
                  fontSize={13}
                  fontFamily="'SF Mono', 'Fira Code', monospace"
                  fontWeight={600}
                >
                  {gb}
                </text>
              </g>
            );
          })}

          {/* X tick labels */}
          {xTicks.map((k, i) => {
            const x = toSvgX(k);
            const tickSpring = spring({
              frame,
              fps,
              config: { damping: 200 },
              delay: Math.round(0.4 * fps) + i * 3,
            });
            return (
              <g key={`x-${k}`} opacity={tickSpring}>
                <line
                  x1={x}
                  y1={CHART_BOTTOM}
                  x2={x}
                  y2={CHART_BOTTOM + 6}
                  stroke={tqColors.border}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={CHART_BOTTOM + 22}
                  textAnchor="middle"
                  fill={tqColors.mutedForeground}
                  fontSize={13}
                  fontFamily="'SF Mono', 'Fira Code', monospace"
                  fontWeight={600}
                >
                  {k}K
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={CHART_LEFT + CHART_W / 2}
            y={CHART_BOTTOM + 48}
            textAnchor="middle"
            fill={tqColors.mutedForeground}
            fontSize={15}
            fontFamily={inter}
            fontWeight={600}
          >
            Context Length (tokens)
          </text>
          <text
            x={20}
            y={CHART_TOP + CHART_H / 2}
            textAnchor="middle"
            fill={tqColors.mutedForeground}
            fontSize={15}
            fontFamily={inter}
            fontWeight={600}
            transform={`rotate(-90, 20, ${CHART_TOP + CHART_H / 2})`}
          >
            Memory (GB)
          </text>

          {/* Fill area under line */}
          {lineProgress > 0 && (
            <polygon
              points={fillPoints}
              fill="url(#fillGrad)"
              opacity={lineProgress * 0.6}
            />
          )}

          {/* The line */}
          <polyline
            points={linePath}
            fill="none"
            stroke={`hsl(${lineHue}, 80%, 55%)`}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
          />

          {/* Glowing dot at line tip */}
          {lineProgress > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={6}
              fill={`hsl(${lineHue}, 80%, 55%)`}
              filter="url(#dotGlow)"
              opacity={lineProgress > 0.01 ? 1 : 0}
            />
          )}

          {/* Milestone callouts */}
          {milestones.map((ms, i) => {
            const [k, gb] = dataPoints[ms.idx];
            const x = toSvgX(k);
            const y = toSvgY(gb);
            const s = milestoneSprings[i];
            const scale = interpolate(s, [0, 1], [0.3, 1]);
            const isRed = ms.color === tqColors.destructive;
            return (
              <g key={ms.label} opacity={s}>
                {/* Dot on the line */}
                <circle cx={x} cy={y} r={5} fill={ms.color} />
                {/* Callout card — position left for rightmost point */}
                <g transform={`translate(${i === milestones.length - 1 ? x - 175 : x + 12}, ${y - 22}) scale(${scale})`}>
                  <rect
                    x={0}
                    y={0}
                    width={160}
                    height={32}
                    rx={8}
                    fill="rgba(15, 23, 42, 0.85)"
                    stroke={ms.color}
                    strokeWidth={1.5}
                    style={
                      isRed
                        ? {
                            filter: `drop-shadow(0 0 ${8 * redPulse}px ${ms.color}80)`,
                          }
                        : undefined
                    }
                  />
                  <text
                    x={80}
                    y={20}
                    textAnchor="middle"
                    fill={ms.color}
                    fontSize={14}
                    fontFamily="'SF Mono', 'Fira Code', monospace"
                    fontWeight={700}
                  >
                    {ms.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom: formula + tagline on one line */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: formulaSpring,
          transform: `translateY(${interpolate(formulaSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 16,
            fontWeight: 600,
            color: tqColors.mutedForeground,
          }}
        >
          Memory = <span style={{ color: tqColors.primary }}>2</span> × L × d × <span style={{ color: tqColors.destructive }}>n</span> × sizeof(fp16)
          <span style={{ margin: "0 12px", color: tqColors.border }}>|</span>
          <span style={{ color: tqColors.mutedForeground, fontFamily: inter, fontSize: 14 }}>
            Linear in <span style={{ color: tqColors.destructive }}>n</span> tokens
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
