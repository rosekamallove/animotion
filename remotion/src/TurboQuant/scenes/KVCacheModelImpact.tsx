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

export const KVCacheModelImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- 8B model card ---
  const card1Spring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(0.5 * fps),
  });
  const card1Scale = interpolate(card1Spring, [0, 1], [0.5, 1]);
  const card1Y = interpolate(card1Spring, [0, 1], [60, 0]);

  // 8B VRAM bar fills
  const bar1Spring = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 60 },
    delay: Math.round(1.2 * fps),
  });
  const bar1Width = interpolate(bar1Spring, [0, 1], [0, 10.4]); // 5GB / 48GB ≈ 10.4%

  // --- 70B model card ---
  const card2Spring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(2.5 * fps),
  });
  const card2Scale = interpolate(card2Spring, [0, 1], [0.5, 1]);
  const card2Y = interpolate(card2Spring, [0, 1], [60, 0]);

  // 70B VRAM bar fills — overshoots 100%
  const bar2Spring = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 60 },
    delay: Math.round(3.2 * fps),
  });
  const bar2Width = interpolate(bar2Spring, [0, 1], [0, 166]); // 80GB / 48GB ≈ 166%

  // Shake on 70B overflow
  const isOverflowing = bar2Spring > 0.6;
  const shakeX = isOverflowing ? Math.sin(frame * 1.3) * 4 : 0;
  const shakeY = isOverflowing ? Math.cos(frame * 1.6) * 2 : 0;

  // Red pulse on 70B
  const redPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.4, 1]);

  // "vs" label
  const vsSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2.2 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(5.0 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      {/* Two model cards side by side */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          padding: "0 100px",
          zIndex: 1,
        }}
      >
        {/* 8B Model */}
        <div
          style={{
            ...tqGlass,
            flex: 1,
            maxWidth: 620,
            padding: "40px 44px",
            opacity: card1Spring,
            transform: `scale(${card1Scale}) translateY(${card1Y}px)`,
            borderTop: `4px solid ${tqColors.primary}`,
          }}
        >
          {/* Model name */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: montserrat,
                fontSize: 56,
                fontWeight: 900,
                color: tqColors.primary,
                lineHeight: 1,
              }}
            >
              8B
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: tqColors.mutedForeground,
              }}
            >
              parameters
            </span>
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: tqColors.mutedForeground,
              marginBottom: 24,
            }}
          >
            32K context window
          </div>

          {/* VRAM bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: tqColors.mutedForeground }}>
                KV Cache VRAM
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: tqColors.warning,
                }}
              >
                ~5 GB
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 24,
                borderRadius: 8,
                backgroundColor: tqColors.muted,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${bar1Width}%`,
                  height: "100%",
                  borderRadius: 8,
                  background: `linear-gradient(90deg, ${tqColors.success}, ${tqColors.warning})`,
                  boxShadow: `0 0 12px ${tqColors.warning}40`,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 12, color: tqColors.mutedForeground }}>0 GB</span>
              <span style={{ fontSize: 12, color: tqColors.mutedForeground }}>48 GB (A6000)</span>
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              marginTop: 16,
              padding: "8px 16px",
              borderRadius: 8,
              backgroundColor: `${tqColors.warning}15`,
              border: `1px solid ${tqColors.warning}30`,
              fontSize: 14,
              fontWeight: 600,
              color: tqColors.warning,
              textAlign: "center",
              opacity: bar1Spring,
            }}
          >
            Manageable — but that's just the cache
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 28,
            fontWeight: 900,
            color: tqColors.mutedForeground,
            opacity: vsSpring,
          }}
        >
          vs
        </div>

        {/* 70B Model */}
        <div
          style={{
            ...tqGlass,
            flex: 1,
            maxWidth: 620,
            padding: "40px 44px",
            opacity: card2Spring,
            transform: `scale(${card2Scale}) translateY(${card2Y}px) translate(${shakeX}px, ${shakeY}px)`,
            borderTop: `4px solid ${tqColors.destructive}`,
            boxShadow: isOverflowing
              ? `0 0 ${30 * redPulse}px ${tqColors.destructive}30, 0 4px 24px rgba(0,0,0,0.3)`
              : undefined,
          }}
        >
          {/* Model name */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: montserrat,
                fontSize: 56,
                fontWeight: 900,
                color: tqColors.destructive,
                lineHeight: 1,
              }}
            >
              70B
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: tqColors.mutedForeground,
              }}
            >
              parameters
            </span>
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: tqColors.mutedForeground,
              marginBottom: 24,
            }}
          >
            32K context window
          </div>

          {/* VRAM bar — overflows */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: tqColors.mutedForeground }}>
                KV Cache VRAM
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: tqColors.destructive,
                }}
              >
                ~80 GB
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 24,
                borderRadius: 8,
                backgroundColor: tqColors.muted,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${Math.min(bar2Width, 100)}%`,
                  height: "100%",
                  borderRadius: 8,
                  background: `linear-gradient(90deg, ${tqColors.warning}, ${tqColors.destructive})`,
                  boxShadow: isOverflowing
                    ? `0 0 ${20 * redPulse}px ${tqColors.destructive}60`
                    : undefined,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 12, color: tqColors.mutedForeground }}>0 GB</span>
              <span style={{ fontSize: 12, color: tqColors.destructive, fontWeight: 700 }}>
                48 GB (A6000) — EXCEEDED
              </span>
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              marginTop: 16,
              padding: "8px 16px",
              borderRadius: 8,
              backgroundColor: `${tqColors.destructive}15`,
              border: `1px solid ${tqColors.destructive}40`,
              fontSize: 14,
              fontWeight: 700,
              color: tqColors.destructive,
              textAlign: "center",
              opacity: bar2Spring > 0.5 ? 1 : 0,
              boxShadow: isOverflowing
                ? `0 0 ${16 * redPulse}px ${tqColors.destructive}40`
                : undefined,
            }}
          >
            Exceeds most GPUs — the model chokes
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          transform: `translateY(${interpolate(bottomSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 600,
            color: tqColors.mutedForeground,
          }}
        >
          The model weights aren't the problem.{" "}
          <span style={{ color: tqColors.primary, fontWeight: 700 }}>
            The KV cache is.
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
