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
import { Check } from "lucide-react";
import { tqColors, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Pre-computed jagged waveform points
const wavePoints = Array.from({ length: 80 }, (_, i) => {
  const x = (i / 79) * 1600;
  const noise =
    Math.sin(i * 0.7) * 60 +
    Math.cos(i * 1.3) * 40 +
    Math.sin(i * 2.1) * 25;
  return { x, y: 200 + noise };
});

// Pre-computed quantized blocks
const NUM_BLOCKS = 40;
const blocks = Array.from({ length: NUM_BLOCKS }, (_, i) => {
  const centerX = (i / (NUM_BLOCKS - 1)) * 1600;
  // Determine +1 or -1 based on waveform position at this x
  const waveIndex = Math.min(
    Math.floor((i / NUM_BLOCKS) * 80),
    wavePoints.length - 1,
  );
  const isAbove = wavePoints[waveIndex].y < 200;
  return {
    x: centerX - 18,
    y: 185,
    width: 36,
    height: 30,
    value: isAbove ? 1 : -1,
  };
});

const wavePolyline = wavePoints.map((p) => `${p.x},${p.y}`).join(" ");

export const QJLSafeguard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Title animations ---
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 0,
  });
  const subtitleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.4 * fps),
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const subtitleY = interpolate(subtitleSpring, [0, 1], [20, 0]);

  // --- Waveform fade-in ---
  const waveSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
  });

  // --- Scanner position ---
  const scanStart = Math.round(3 * fps);
  const scanEnd = Math.round(7 * fps);
  const scanX = interpolate(frame, [scanStart, scanEnd], [0, 1600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- "1-Bit Output" label (appears when scan ~50%) ---
  const bitLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(5 * fps),
  });

  // --- Comparison section (appears after scan completes ~8s) ---
  const comparisonSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8 * fps),
  });
  const bar1Width = interpolate(comparisonSpring, [0, 1], [0, 75]);
  const bar2Width = interpolate(comparisonSpring, [0, 1], [0, 75]);
  const comparisonY = interpolate(comparisonSpring, [0, 1], [30, 0]);

  const checkSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    delay: Math.round(9 * fps),
  });
  const checkScale = interpolate(checkSpring, [0, 1], [0, 1]);

  // Scanner visibility (only show while scanning is active or just finished)
  const scannerOpacity = interpolate(
    frame,
    [scanStart, scanStart + 3, scanEnd - 3, scanEnd + Math.round(0.5 * fps)],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, ...gridBackground }} />

      {/* Background accents */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.accent}10 0%, transparent 70%)`,
          top: -100,
          right: -50,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primary}08 0%, transparent 70%)`,
          bottom: -80,
          left: -60,
        }}
      />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          marginTop: 40,
        }}
      >
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 56,
            fontWeight: 900,
            color: tqColors.primary,
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
            letterSpacing: "-0.02em",
          }}
        >
          Stage 2: The 1-Bit Safeguard
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 500,
            color: tqColors.mutedForeground,
            opacity: subtitleSpring,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 8,
          }}
        >
          Quantized Johnson-Lindenstrauss
        </div>
      </div>

      {/* Main SVG waveform with scanning laser */}
      <div
        style={{
          zIndex: 1,
          marginTop: 30,
          width: "90%",
          position: "relative",
        }}
      >
        {/* Residual Error label */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 600,
            color: tqColors.destructive,
            opacity: waveSpring,
            marginBottom: 6,
            marginLeft: 8,
          }}
        >
          Residual Error
        </div>

        <svg
          viewBox="0 0 1600 400"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        >
          <defs>
            {/* Scanner glow filter */}
            <filter id="scanGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Trailing gradient */}
            <linearGradient
              id="trailGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={tqColors.primary} stopOpacity={0} />
              <stop
                offset="100%"
                stopColor={tqColors.primary}
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>

          {/* Quantized blocks (revealed behind scanner) */}
          {blocks.map((block, i) => {
            const blockCenterX = block.x + block.width / 2;
            const pastScanner = scanX > blockCenterX + 20;
            const blockOpacity = pastScanner ? 1 : 0;
            const distPast = scanX - blockCenterX;
            const blockScale = pastScanner
              ? interpolate(distPast, [20, 80], [0.7, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0;
            const isPositive = block.value === 1;
            const fillColor = isPositive
              ? `${tqColors.success}20`
              : `${tqColors.accent}20`;
            const strokeColor = isPositive
              ? tqColors.success
              : tqColors.accent;
            const textColor = isPositive
              ? tqColors.success
              : tqColors.accentLight;

            return (
              <g
                key={`block-${i}`}
                opacity={blockOpacity}
                transform={`translate(${blockCenterX}, ${block.y + block.height / 2}) scale(${blockScale}) translate(${-blockCenterX}, ${-(block.y + block.height / 2)})`}
              >
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.width}
                  height={block.height}
                  rx={4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  x={blockCenterX}
                  y={block.y + block.height / 2 + 5}
                  textAnchor="middle"
                  fontFamily={inter}
                  fontSize={13}
                  fontWeight={700}
                  fill={textColor}
                >
                  {isPositive ? "+1" : "-1"}
                </text>
              </g>
            );
          })}

          {/* Jagged waveform polyline (visible only ahead of scanner) */}
          <clipPath id="waveClip">
            <rect x={scanX} y={0} width={1600 - scanX} height={400} />
          </clipPath>
          <polyline
            points={wavePolyline}
            stroke={tqColors.destructive}
            strokeWidth={2.5}
            fill="none"
            opacity={0.8 * waveSpring}
            clipPath="url(#waveClip)"
          />

          {/* Trailing glow rectangle */}
          <rect
            x={Math.max(0, scanX - 80)}
            y={0}
            width={80}
            height={400}
            fill="url(#trailGrad)"
            opacity={scannerOpacity}
          />

          {/* Scanner vertical line */}
          <line
            x1={scanX}
            y1={0}
            x2={scanX}
            y2={400}
            stroke={tqColors.primary}
            strokeWidth={3}
            filter="url(#scanGlow)"
            opacity={scannerOpacity}
          />
        </svg>

        {/* "1-Bit Output" label */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 600,
            color: tqColors.primary,
            opacity: bitLabelSpring,
            marginTop: 8,
            marginLeft: 8,
          }}
        >
          1-Bit Output
        </div>
      </div>

      {/* Comparison section */}
      <div
        style={{
          zIndex: 1,
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: comparisonSpring,
          transform: `translateY(${comparisonY}px)`,
        }}
      >
        {/* Original bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 500,
              color: tqColors.mutedForeground,
              width: 240,
              textAlign: "right",
            }}
          >
            Original Attention Score
          </div>
          <div
            style={{
              width: 400,
              height: 24,
              backgroundColor: tqColors.muted,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${bar1Width}%`,
                height: "100%",
                backgroundColor: tqColors.primary,
                borderRadius: 8,
                boxShadow: `0 0 12px ${tqColors.primary}40`,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 600,
              color: tqColors.foreground,
              width: 50,
            }}
          >
            {Math.round(bar1Width)}%
          </div>
        </div>

        {/* Equals + check row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            marginLeft: 240,
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 28,
              fontWeight: 700,
              color: tqColors.foreground,
              opacity: comparisonSpring,
            }}
          >
            =
          </div>
          <div
            style={{
              opacity: checkSpring,
              transform: `scale(${checkScale})`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Check size={22} color={tqColors.success} strokeWidth={3} />
            <span
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 700,
                color: tqColors.success,
              }}
            >
              Statistically Identical
            </span>
          </div>
        </div>

        {/* Compressed bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 500,
              color: tqColors.mutedForeground,
              width: 240,
              textAlign: "right",
            }}
          >
            Compressed Attention Score
          </div>
          <div
            style={{
              width: 400,
              height: 24,
              backgroundColor: tqColors.muted,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${bar2Width}%`,
                height: "100%",
                backgroundColor: tqColors.primary,
                borderRadius: 8,
                boxShadow: `0 0 12px ${tqColors.primary}40`,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 600,
              color: tqColors.foreground,
              width: 50,
            }}
          >
            {Math.round(bar2Width)}%
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
