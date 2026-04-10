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
import { ArrowRight } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const tokens = ["The", "cat", "sat", "on", "the", "mat"];

const kvPairs = [
  {
    key: [0.31, -0.72, 0.55, 1.04],
    value: [0.82, -0.15, 0.44, 1.07, -0.63, 0.29, -0.91, 0.56],
  },
  {
    key: [-0.48, 0.91, -0.33, 0.67],
    value: [-0.21, 0.77, -0.58, 0.13, 0.94, -0.42, 0.36, -0.85],
  },
  {
    key: [0.65, 0.12, -0.89, -0.27],
    value: [0.53, -0.68, 0.11, -0.94, 0.47, 0.72, -0.36, 0.19],
  },
  {
    key: [-0.14, 0.58, 0.73, -0.41],
    value: [-0.87, 0.34, 0.62, -0.15, -0.53, 0.91, 0.28, -0.74],
  },
  {
    key: [0.42, -0.36, 0.18, 0.89],
    value: [0.16, -0.49, 0.83, 0.37, -0.71, -0.22, 0.65, 0.48],
  },
  {
    key: [-0.77, 0.23, -0.61, 0.45],
    value: [0.39, 0.58, -0.27, 0.81, -0.14, 0.66, -0.53, -0.92],
  },
];

export const PromptToKV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Prompt text appears (0-1s)
  const promptSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.2 * fps),
  });

  // Phase 2: Tokens highlight one by one (1-2.5s)
  const tokenSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round((1.0 + i * 0.25) * fps),
    }),
  );

  // Phase 3: Arrow appears (2.8s)
  const arrowSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2.8 * fps),
  });

  // Phase 4: KV cache table appears (3.2s)
  const tableSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.2 * fps),
  });

  // Phase 5: KV rows populate one by one (3.5s+)
  const rowSprings = kvPairs.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 100 },
      delay: Math.round((3.5 + i * 0.4) * fps),
    }),
  );

  // Phase 6: Dimension label (6.5s)
  const dimLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(6.5 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          padding: "0 80px",
          zIndex: 1,
        }}
      >
        {/* LEFT: Prompt input */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            flex: "0 0 380px",
          }}
        >
          {/* Prompt label */}
          <div
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 600,
              color: tqColors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 2,
              opacity: promptSpring,
            }}
          >
            Input Prompt
          </div>

          {/* Prompt card */}
          <div
            style={{
              ...tqGlass,
              padding: "24px 28px",
              opacity: promptSpring,
              transform: `translateY(${interpolate(promptSpring, [0, 1], [20, 0])}px)`,
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 22,
                fontWeight: 500,
                color: tqColors.foreground,
                lineHeight: 1.8,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {tokens.map((token, i) => {
                const highlighted = tokenSprings[i];
                const bgOpacity = interpolate(highlighted, [0, 1], [0, 0.15]);
                const borderOpacity = interpolate(highlighted, [0, 1], [0, 0.5]);
                return (
                  <span
                    key={i}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      backgroundColor: `rgba(0, 212, 255, ${bgOpacity})`,
                      border: `1px solid rgba(0, 212, 255, ${borderOpacity})`,
                      color: interpolate(highlighted, [0, 1], [0.88, 1]) > 0.95
                        ? tqColors.primary
                        : tqColors.foreground,
                      fontWeight: highlighted > 0.5 ? 700 : 500,
                    }}
                  >
                    {token}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Token count */}
          <div
            style={{
              fontFamily: inter,
              fontSize: 14,
              color: tqColors.mutedForeground,
              opacity: tokenSprings[tokens.length - 1] ?? 0,
            }}
          >
            {tokens.length} tokens
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: arrowSpring,
            transform: `translateX(${interpolate(arrowSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <ArrowRight size={36} color={tqColors.mutedForeground} />
          <div
            style={{
              fontFamily: inter,
              fontSize: 12,
              fontWeight: 600,
              color: tqColors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Attention
          </div>
        </div>

        {/* RIGHT: KV Cache */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: tableSpring,
            transform: `translateY(${interpolate(tableSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {/* KV Cache header */}
          <div
            style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 600,
              color: tqColors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 2,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            KV Cache
          </div>

          {/* Header row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "0 16px",
              opacity: tableSpring,
            }}
          >
            <div
              style={{
                width: 70,
                fontFamily: inter,
                fontSize: 12,
                fontWeight: 700,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Token
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: inter,
                fontSize: 12,
                fontWeight: 700,
                color: tqColors.primary,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Key Vector
            </div>
            <div
              style={{
                flex: 2,
                fontFamily: inter,
                fontSize: 12,
                fontWeight: 700,
                color: tqColors.accent,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Value Vector
            </div>
          </div>

          {/* KV rows */}
          {kvPairs.map((pair, i) => {
            const rowScale = interpolate(rowSprings[i], [0, 1], [0.8, 1]);
            const rowX = interpolate(rowSprings[i], [0, 1], [40, 0]);
            return (
              <div
                key={i}
                style={{
                  ...tqGlass,
                  borderRadius: 10,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: rowSprings[i],
                  transform: `translateX(${rowX}px) scale(${rowScale})`,
                }}
              >
                {/* Token */}
                <div
                  style={{
                    width: 70,
                    fontFamily: inter,
                    fontSize: 15,
                    fontWeight: 700,
                    color: tqColors.foreground,
                  }}
                >
                  {tokens[i]}
                </div>

                {/* Key vector */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: inter, fontSize: 13, color: tqColors.mutedForeground }}>
                    [
                  </span>
                  {pair.key.map((v, j) => (
                    <span
                      key={j}
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: tqColors.primaryLight,
                      }}
                    >
                      {v.toFixed(2)}
                      {j < pair.key.length - 1 ? "," : ""}
                    </span>
                  ))}
                  <span style={{ fontFamily: inter, fontSize: 13, color: tqColors.mutedForeground }}>
                    ]
                  </span>
                </div>

                {/* Value vector */}
                <div
                  style={{
                    flex: 2,
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: inter, fontSize: 13, color: tqColors.mutedForeground }}>
                    [
                  </span>
                  {pair.value.map((v, j) => (
                    <span
                      key={j}
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: tqColors.accentLight,
                      }}
                    >
                      {v.toFixed(2)}
                      {j < pair.value.length - 1 ? "," : ""}
                    </span>
                  ))}
                  <span style={{ fontFamily: inter, fontSize: 13, color: tqColors.mutedForeground }}>
                    ]
                  </span>
                </div>
              </div>
            );
          })}

          {/* Dimension label */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 24,
              padding: "4px 16px",
              opacity: dimLabelSpring,
              transform: `translateY(${interpolate(dimLabelSpring, [0, 1], [10, 0])}px)`,
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 600,
                color: tqColors.primary,
              }}
            >
              d=4
            </span>
            <span
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 600,
                color: tqColors.accent,
              }}
            >
              d=8 (multi-dimensional)
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
