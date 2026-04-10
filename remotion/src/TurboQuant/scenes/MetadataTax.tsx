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

// Bit widths to demonstrate
const bitSteps = [
  { bits: 16, label: "FP16 (Original)", metaRatio: 0, dataColor: tqColors.primary },
  { bits: 4, label: "4-bit Quantized", metaRatio: 0.25, dataColor: tqColors.primaryLight },
  { bits: 3, label: "3-bit Quantized", metaRatio: 0.45, dataColor: tqColors.accent },
];

// Block visualization: 8 blocks per row
const NUM_BLOCKS = 8;

export const MetadataTax: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Phase 1: Show 16-bit original (0-2s) ---
  const phase1Spring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });

  // --- Phase 2: Compress to 4-bit (2.5-4.5s) ---
  const phase2Spring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(2.5 * fps),
  });

  // 4-bit metadata blocks appear
  const meta4Springs = Array.from({ length: NUM_BLOCKS }, (_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(3.0 * fps) + i * 2,
    }),
  );

  // --- Phase 3: Try 3-bit — metadata explodes (5-8s) ---
  const phase3Spring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(5.0 * fps),
  });

  // 3-bit metadata blocks appear (bigger, more aggressive)
  const meta3Springs = Array.from({ length: NUM_BLOCKS }, (_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 130 },
      delay: Math.round(5.5 * fps) + i * 2,
    }),
  );

  // Red X / "defeats the purpose" moment
  const defeatSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
    delay: Math.round(7.0 * fps),
  });
  const defeatScale = interpolate(defeatSpring, [0, 1], [0.3, 1]);

  // Savings comparison bars
  const savingsSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.0 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(9.0 * fps),
  });

  // Shake on the 3-bit row
  const is3BitShowing = frame > Math.round(7.0 * fps);
  const shakeX = is3BitShowing ? Math.sin(frame * 1.0) * 3 : 0;

  // Red pulse
  const redPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.4, 1]);

  // Helper: render a block row
  const renderBlockRow = (
    bitStep: typeof bitSteps[number],
    rowSpring: number,
    metaSprings: number[] | null,
    isDefeated: boolean,
  ) => {
    const dataWidth = isDefeated ? 55 : 70;
    const shake = isDefeated ? shakeX : 0;

    return (
      <div
        style={{
          opacity: rowSpring,
          transform: `translateX(${shake}px) translateY(${interpolate(Math.min(rowSpring, 1), [0, 1], [20, 0])}px)`,
        }}
      >
        {/* Row label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: montserrat,
                fontSize: 20,
                fontWeight: 900,
                color: bitStep.dataColor,
              }}
            >
              {bitStep.bits}-bit
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: tqColors.mutedForeground }}>
              {bitStep.label}
            </span>
          </div>
          {bitStep.metaRatio > 0 && (
            <span
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 13,
                fontWeight: 700,
                color: isDefeated ? tqColors.destructive : tqColors.warning,
              }}
            >
              +{Math.round(bitStep.metaRatio * 100)}% metadata overhead
            </span>
          )}
        </div>

        {/* Blocks */}
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: NUM_BLOCKS }, (_, i) => {
            const metaS = metaSprings ? metaSprings[i] : 0;
            const hasMetadata = bitStep.metaRatio > 0;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Data block */}
                <div
                  style={{
                    height: 44,
                    borderRadius: 6,
                    backgroundColor: `${bitStep.dataColor}20`,
                    border: `1.5px solid ${bitStep.dataColor}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    color: bitStep.dataColor,
                    width: hasMetadata ? `${dataWidth}%` : "100%",
                    alignSelf: "stretch",
                    minWidth: 0,
                  }}
                >
                  {bitStep.bits}b
                </div>

                {/* Metadata block */}
                {hasMetadata && (
                  <div
                    style={{
                      height: isDefeated
                        ? interpolate(metaS, [0, 1], [0, 36])
                        : interpolate(metaS, [0, 1], [0, 22]),
                      borderRadius: 4,
                      backgroundColor: `${tqColors.destructive}20`,
                      border: `1.5px solid ${isDefeated ? tqColors.destructive : tqColors.warning}60`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      color: isDefeated ? tqColors.destructive : tqColors.warning,
                      opacity: metaS,
                      overflow: "hidden",
                      boxShadow: isDefeated
                        ? `0 0 ${8 * redPulse}px ${tqColors.destructive}30`
                        : undefined,
                    }}
                  >
                    16b meta
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
          top: 50,
          left: 80,
          right: 80,
          bottom: 60,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", opacity: phase1Spring }}>
          <span
            style={{
              fontFamily: montserrat,
              fontSize: 40,
              fontWeight: 900,
              color: tqColors.foreground,
            }}
          >
            The Metadata{" "}
            <span style={{ color: tqColors.warning }}>Tax</span>
          </span>
        </div>

        {/* Row 1: 16-bit original */}
        {renderBlockRow(bitSteps[0], phase1Spring, null, false)}

        {/* Arrow + "compress" label */}
        <div
          style={{
            textAlign: "center",
            opacity: phase2Spring,
            transform: `translateY(${interpolate(phase2Spring, [0, 1], [10, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: tqColors.mutedForeground,
              padding: "4px 14px",
              borderRadius: 4,
              backgroundColor: tqColors.muted,
            }}
          >
            quantize to save memory
          </span>
        </div>

        {/* Row 2: 4-bit with metadata */}
        {renderBlockRow(bitSteps[1], phase2Spring, meta4Springs, false)}

        {/* Row 3: 3-bit with massive metadata */}
        {renderBlockRow(bitSteps[2], phase3Spring, meta3Springs, true)}

        {/* "Defeats the purpose" badge */}
        <div
          style={{
            textAlign: "center",
            opacity: defeatSpring,
            transform: `scale(${defeatScale})`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 32px",
              borderRadius: 10,
              backgroundColor: `${tqColors.destructive}15`,
              border: `2px solid ${tqColors.destructive}60`,
              boxShadow: `0 0 ${20 * redPulse}px ${tqColors.destructive}30`,
            }}
          >
            {/* X icon */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" stroke={tqColors.destructive} strokeWidth={3} strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" stroke={tqColors.destructive} strokeWidth={3} strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontFamily: montserrat,
                fontSize: 18,
                fontWeight: 900,
                color: tqColors.destructive,
              }}
            >
              Metadata defeats the compression
            </span>
          </div>
        </div>

        {/* Savings comparison */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            opacity: savingsSpring,
            transform: `translateY(${interpolate(savingsSpring, [0, 1], [15, 0])}px)`,
          }}
        >
          {[
            { label: "Expected savings", value: "5.3x", color: tqColors.success, sub: "at 3-bit" },
            { label: "Actual savings", value: "2.8x", color: tqColors.destructive, sub: "after metadata" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...tqGlass,
                padding: "14px 28px",
                textAlign: "center",
                borderTop: `3px solid ${stat.color}`,
                minWidth: 200,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: tqColors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: montserrat,
                  fontSize: 36,
                  fontWeight: 900,
                  color: stat.color,
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: tqColors.mutedForeground }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: tqColors.mutedForeground }}>
          At 3-bit, the metadata overhead{" "}
          <span style={{ color: tqColors.destructive, fontWeight: 700 }}>completely defeats the purpose.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
