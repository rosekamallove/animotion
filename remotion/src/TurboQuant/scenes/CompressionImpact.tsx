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
import { Smartphone } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const CompressionImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Phase 1: Big KV cache block appears (0-1.5s) ---
  const blockSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(0.3 * fps),
  });

  // "Before" label
  const beforeLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.8 * fps),
  });

  // --- Phase 2: Shrink to 1/6th (2-3.5s) ---
  const shrinkSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
    delay: Math.round(2.0 * fps),
  });

  const blockWidth = interpolate(shrinkSpring, [0, 1], [800, 133]);
  const blockHeight = interpolate(shrinkSpring, [0, 1], [260, 260]);

  // "6x" label pops
  const sixXSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
    delay: Math.round(3.0 * fps),
  });

  // Freed space lights up green
  const freedSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.2 * fps),
  });

  // --- Phase 3: Impact stats cascade in (4-7s) ---
  const stat1Spring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
    delay: Math.round(4.0 * fps),
  });
  const stat2Spring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
    delay: Math.round(5.0 * fps),
  });
  const stat3Spring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
    delay: Math.round(6.0 * fps),
  });

  // Context counter (counts from 128K to 768K)
  const counterStart = Math.round(4.0 * fps);
  const counterEnd = Math.round(4.8 * fps);
  const contextCount = interpolate(
    frame,
    [counterStart, counterEnd],
    [128, 768],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const isCountComplete = frame >= counterEnd;

  // Phone icon
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    delay: Math.round(7.5 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.5 * fps),
  });

  // Glow pulse on the compressed block
  const glowPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          gap: 24,
        }}
      >
        {/* KV Cache block + freed space container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            height: 280,
            position: "relative",
            marginBottom: 16,
          }}
        >
          {/* The KV Cache block */}
          <div
            style={{
              width: blockWidth,
              height: blockHeight,
              borderRadius: 16,
              background: shrinkSpring > 0.5
                ? `linear-gradient(135deg, ${tqColors.primary}30, ${tqColors.accent}20)`
                : `linear-gradient(135deg, ${tqColors.destructive}25, ${tqColors.warning}15)`,
              border: `2px solid ${shrinkSpring > 0.5 ? tqColors.primary : tqColors.destructive}50`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: blockSpring,
              transform: `scale(${interpolate(blockSpring, [0, 1], [0.5, 1])})`,
              overflow: "hidden",
              position: "relative",
              boxShadow: shrinkSpring > 0.5
                ? `0 0 ${24 * glowPulse}px ${tqColors.primary}30`
                : `0 0 12px ${tqColors.destructive}20`,
            }}
          >
            {/* Block inner content */}
            <div
              style={{
                fontFamily: montserrat,
                fontSize: shrinkSpring > 0.3 ? 18 : 28,
                fontWeight: 900,
                color: shrinkSpring > 0.5 ? tqColors.primary : tqColors.foreground,
                textAlign: "center",
              }}
            >
              KV Cache
            </div>
            {shrinkSpring < 0.3 && (
              <div
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  color: tqColors.mutedForeground,
                  marginTop: 8,
                }}
              >
                16-bit × {"{L × d × n}"}
              </div>
            )}

            {/* "Before" label */}
            {shrinkSpring < 0.3 && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: tqColors.destructive,
                  opacity: beforeLabelSpring,
                }}
              >
                BEFORE
              </div>
            )}

            {/* "After" label */}
            {shrinkSpring > 0.5 && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: tqColors.success,
                  opacity: shrinkSpring,
                }}
              >
                AFTER
              </div>
            )}
          </div>

          {/* 6x label */}
          {sixXSpring > 0 && (
            <div
              style={{
                position: "absolute",
                top: -50,
                left: "50%",
                transform: `translateX(-50%) scale(${interpolate(sixXSpring, [0, 1], [0.3, 1])})`,
                opacity: sixXSpring,
              }}
            >
              <div
                style={{
                  fontFamily: montserrat,
                  fontSize: 48,
                  fontWeight: 900,
                  color: tqColors.success,
                  textShadow: `0 0 20px ${tqColors.success}60`,
                }}
              >
                6x smaller
              </div>
            </div>
          )}

          {/* Freed space visualization */}
          {freedSpring > 0 && (
            <div
              style={{
                width: interpolate(freedSpring, [0, 1], [0, 650]),
                height: 260,
                borderRadius: "0 16px 16px 0",
                border: `2px dashed ${tqColors.success}40`,
                backgroundColor: `${tqColors.success}08`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: freedSpring,
                marginLeft: -2,
              }}
            >
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 16,
                  fontWeight: 700,
                  color: tqColors.success,
                  opacity: freedSpring > 0.5 ? 1 : 0,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                freed memory
              </span>
            </div>
          )}
        </div>

        {/* Impact stats row */}
        <div
          style={{
            display: "flex",
            gap: 28,
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {/* Stat 1: Context window */}
          <div
            style={{
              ...tqGlass,
              padding: "20px 32px",
              textAlign: "center",
              borderTop: `3px solid ${tqColors.primary}`,
              minWidth: 240,
              opacity: stat1Spring,
              transform: `scale(${interpolate(stat1Spring, [0, 1], [0.3, 1])}) translateY(${interpolate(stat1Spring, [0, 1], [80, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 42,
                fontWeight: 900,
                color: tqColors.primary,
                lineHeight: 1,
              }}
            >
              {Math.round(contextCount)}K{isCountComplete ? "+" : ""}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                marginTop: 8,
              }}
            >
              context window
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                color: tqColors.mutedForeground,
                marginTop: 4,
                opacity: 0.7,
              }}
            >
              up from 128K
            </div>
          </div>

          {/* Stat 2: Entire codebases */}
          <div
            style={{
              ...tqGlass,
              padding: "20px 32px",
              textAlign: "center",
              borderTop: `3px solid ${tqColors.accent}`,
              minWidth: 240,
              opacity: stat2Spring,
              transform: `scale(${interpolate(stat2Spring, [0, 1], [0.3, 1])}) translateY(${interpolate(stat2Spring, [0, 1], [80, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 42,
                fontWeight: 900,
                color: tqColors.accent,
                lineHeight: 1,
              }}
            >
              {"{ }"}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                marginTop: 8,
              }}
            >
              entire codebases
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                color: tqColors.mutedForeground,
                marginTop: 4,
                opacity: 0.7,
              }}
            >
              without choking
            </div>
          </div>

          {/* Stat 3: Same GPU */}
          <div
            style={{
              ...tqGlass,
              padding: "20px 32px",
              textAlign: "center",
              borderTop: `3px solid ${tqColors.success}`,
              minWidth: 240,
              opacity: stat3Spring,
              transform: `scale(${interpolate(stat3Spring, [0, 1], [0.3, 1])}) translateY(${interpolate(stat3Spring, [0, 1], [80, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 42,
                fontWeight: 900,
                color: tqColors.success,
                lineHeight: 1,
              }}
            >
              Same GPU
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                marginTop: 8,
              }}
            >
              no new hardware
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                color: tqColors.mutedForeground,
                marginTop: 4,
                opacity: 0.7,
              }}
            >
              even runs on mobile
            </div>
          </div>
        </div>

        {/* Phone icon */}
        <div
          style={{
            opacity: phoneSpring,
            transform: `scale(${interpolate(phoneSpring, [0, 1], [0.3, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
          }}
        >
          <Smartphone size={20} color={tqColors.success} />
          <span
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 600,
              color: tqColors.success,
            }}
          >
            Models on your phone. For real.
          </span>
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
        <span style={{ fontSize: 17, fontWeight: 600, color: tqColors.mutedForeground }}>
          This isn't a slight optimization.{" "}
          <span style={{ color: tqColors.primary, fontWeight: 700 }}>
            It fundamentally changes what hardware can run what models.
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
