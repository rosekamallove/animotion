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
import { Brain } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const KV_PAIRS = 8;
const subscriptDigits = [
  "\u2081",
  "\u2082",
  "\u2083",
  "\u2084",
  "\u2085",
  "\u2086",
  "\u2087",
  "\u2088",
];
const kvLabels = Array.from({ length: KV_PAIRS }, (_, i) => ({
  key: `K${subscriptDigits[i]}`,
  value: `V${subscriptDigits[i]}`,
}));

export const MemoryWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 0,
  });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // KV pairs slide in staggered (starting ~1s)
  const kvSprings = kvLabels.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(1.0 * fps) + i * 4,
    }),
  );

  // Total KV progress drives the VRAM bar
  const totalKvProgress =
    kvSprings.reduce((sum, s) => sum + s, 0) / KV_PAIRS;

  // Map KV progress to VRAM fill (0 -> 5%, 1 -> 60%)
  const memoryFill = interpolate(totalKvProgress, [0, 1], [0.05, 0.6]);

  // Overflow phase (~8s, pushes past 100%)
  const overflowSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
    delay: Math.round(8.0 * fps),
  });

  const memoryFillFinal = interpolate(
    overflowSpring,
    [0, 1],
    [memoryFill, 1.15],
  );
  const isOverflowing = overflowSpring > 0.5;

  // Fill color transitions green -> yellow -> red
  const fillHue = interpolate(
    memoryFillFinal,
    [0.05, 0.5, 0.85],
    [120, 45, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Shake effect when overflowing
  const shakeX = isOverflowing ? Math.sin(frame * 1.2) * 6 : 0;
  const shakeY = isOverflowing ? Math.cos(frame * 1.5) * 4 : 0;

  // Overflow text spring (bouncy)
  const overflowTextSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
    delay: Math.round(8.0 * fps) + 10,
  });
  const overflowTextScale = interpolate(
    overflowTextSpring,
    [0, 1],
    [0.3, 1],
  );

  // Overflow pulsing glow
  const overflowPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.4, 1],
  );

  // GPU bar container appearance
  const gpuBarAppear = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
  });

  // Stat cards (appear ~9s and ~10s)
  const stat1 = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(9.0 * fps),
  });
  const stat2 = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(10.0 * fps),
  });
  const stat1Y = interpolate(stat1, [0, 1], [30, 0]);
  const stat2Y = interpolate(stat2, [0, 1], [30, 0]);

  // Bottleneck text (appears ~12s)
  const bottleneck = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(12.0 * fps),
  });
  const bottleneckY = interpolate(bottleneck, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, ...gridBackground }} />

      {/* Background accent circles */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.accent}08 0%, transparent 70%)`,
          top: -100,
          right: -80,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primary}06 0%, transparent 70%)`,
          bottom: -80,
          left: -60,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          opacity: titleProgress,
          transform: `translateY(${titleY}px)`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${tqColors.accent}30, ${tqColors.primary}30)`,
            border: `1px solid ${tqColors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={28} color={tqColors.primary} />
        </div>
        <span
          style={{
            fontFamily: montserrat,
            fontSize: 52,
            fontWeight: 900,
            color: tqColors.foreground,
            letterSpacing: "-0.02em",
          }}
        >
          The Memory Wall
        </span>
      </div>

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          bottom: 200,
          display: "flex",
          gap: 48,
          zIndex: 1,
        }}
      >
        {/* LEFT: KV Cache visualization */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 20,
              fontWeight: 600,
              color: tqColors.mutedForeground,
              marginBottom: 12,
              opacity: kvSprings[0],
            }}
          >
            KV Cache Growth
          </div>
          {kvLabels.map((pair, i) => {
            const slideX = interpolate(kvSprings[i], [0, 1], [-200, 0]);
            return (
              <div
                key={i}
                style={{
                  ...tqGlass,
                  borderRadius: 10,
                  padding: "10px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: kvSprings[i],
                  transform: `translateX(${slideX}px)`,
                }}
              >
                {/* Key indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: tqColors.primary,
                      boxShadow: `0 0 8px ${tqColors.primary}60`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 16,
                      fontWeight: 600,
                      color: tqColors.primary,
                    }}
                  >
                    {pair.key}
                  </span>
                </div>
                {/* Separator */}
                <div
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: tqColors.border,
                  }}
                />
                {/* Value indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: tqColors.accent,
                      boxShadow: `0 0 8px ${tqColors.accent}60`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 16,
                      fontWeight: 600,
                      color: tqColors.accent,
                    }}
                  >
                    {pair.value}
                  </span>
                </div>
                {/* Bar fill representing data */}
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: tqColors.muted,
                    marginLeft: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${interpolate(kvSprings[i], [0, 1], [0, 60 + i * 5])}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${tqColors.primary}, ${tqColors.accent})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: GPU VRAM bar */}
        <div
          style={{
            width: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: gpuBarAppear,
            transform: `translate(${shakeX}px, ${shakeY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 18,
              fontWeight: 700,
              color: tqColors.foreground,
              marginBottom: 12,
            }}
          >
            GPU VRAM
          </div>

          {/* Thermometer bar */}
          <div
            style={{
              width: 80,
              height: 360,
              borderRadius: 16,
              border: `2px solid ${tqColors.border}`,
              backgroundColor: tqColors.muted,
              position: "relative",
              overflow: isOverflowing ? "visible" : "hidden",
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${Math.min(memoryFillFinal * 100, 100)}%`,
                borderRadius: "0 0 14px 14px",
                background: `hsl(${fillHue}, 80%, 50%)`,
                boxShadow: `0 0 20px hsl(${fillHue}, 80%, 50%, 0.4)`,
              }}
            />
            {/* Overflow indicator */}
            {isOverflowing && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: -2,
                  right: -2,
                  height: `${Math.max((memoryFillFinal - 1) * 360, 0)}px`,
                  background: `${tqColors.destructive}80`,
                  borderRadius: "14px 14px 0 0",
                  border: `2px solid ${tqColors.destructive}`,
                  borderBottom: "none",
                  opacity: interpolate(overflowSpring, [0.5, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              />
            )}
            {/* Capacity line at 100% */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: -8,
                right: -8,
                height: 2,
                backgroundColor: tqColors.white,
                opacity: 0.4,
              }}
            />
          </div>

          {/* Memory text + overflow label */}
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              transform: isOverflowing
                ? `scale(${overflowTextScale})`
                : undefined,
              boxShadow: isOverflowing
                ? `0 0 ${30 * overflowPulse}px ${tqColors.destructive}80, 0 0 ${60 * overflowPulse}px ${tqColors.destructive}40`
                : undefined,
              borderRadius: 12,
              padding: isOverflowing ? "8px 16px" : undefined,
              backgroundColor: isOverflowing
                ? `${tqColors.destructive}15`
                : undefined,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 20,
                fontWeight: 700,
                color: isOverflowing
                  ? tqColors.destructive
                  : tqColors.foreground,
              }}
            >
              {isOverflowing ? "80GB / 48GB" : "5GB / 48GB"}
            </div>
            {isOverflowing && (
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 16,
                  fontWeight: 700,
                  color: tqColors.destructive,
                  marginTop: 4,
                  letterSpacing: "0.1em",
                  opacity: interpolate(overflowSpring, [0.5, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                OVERFLOW!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: Stat cards */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 60,
          right: 60,
          display: "flex",
          gap: 24,
          zIndex: 2,
        }}
      >
        {/* Stat card 1: 8B */}
        <div
          style={{
            ...tqGlass,
            flex: 1,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: stat1,
            transform: `translateY(${stat1Y}px)`,
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 28,
              fontWeight: 900,
              color: tqColors.primary,
            }}
          >
            8B
          </div>
          <div
            style={{
              width: 1,
              height: 36,
              backgroundColor: tqColors.border,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 16,
                fontWeight: 600,
                color: tqColors.foreground,
              }}
            >
              ~5GB VRAM
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 400,
                color: tqColors.mutedForeground,
              }}
            >
              at 32K context
            </div>
          </div>
        </div>

        {/* Stat card 2: 70B (destructive border) */}
        <div
          style={{
            ...tqGlass,
            flex: 1,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: stat2,
            transform: `translateY(${stat2Y}px)`,
            borderColor: tqColors.destructive,
            boxShadow: `0 0 20px ${tqColors.destructive}20, 0 4px 24px rgba(0,0,0,0.3)`,
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 28,
              fontWeight: 900,
              color: tqColors.destructive,
            }}
          >
            70B
          </div>
          <div
            style={{
              width: 1,
              height: 36,
              backgroundColor: tqColors.border,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 16,
                fontWeight: 600,
                color: tqColors.foreground,
              }}
            >
              ~80GB VRAM
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 400,
                color: tqColors.destructive,
              }}
            >
              Exceeds most GPUs
            </div>
          </div>
        </div>
      </div>

      {/* Bottleneck text */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottleneck,
          transform: `translateY(${bottleneckY}px)`,
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: montserrat,
            fontSize: 26,
            fontWeight: 700,
            color: tqColors.primary,
            textShadow: `0 0 20px ${tqColors.primary}40`,
          }}
        >
          The KV Cache is the bottleneck
        </span>
      </div>
    </AbsoluteFill>
  );
};
