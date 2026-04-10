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

export const KVPairVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Key box appears
  const keySpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(0.3 * fps),
  });
  const keyScale = interpolate(keySpring, [0, 1], [0.4, 1]);

  // Value box appears
  const valueSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(0.8 * fps),
  });
  const valueScale = interpolate(valueSpring, [0, 1], [0.4, 1]);

  // Connector line
  const connectorSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.2 * fps),
  });

  // Vector dimensions fade in
  const vectorSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
  });

  // Label
  const labelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2.0 * fps),
  });

  const vectorDims = [0.82, -0.15, 0.44, 1.07, -0.63, 0.29, -0.91, 0.56];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          zIndex: 1,
        }}
      >
        {/* Key box */}
        <div
          style={{
            opacity: keySpring,
            transform: `scale(${keyScale})`,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "32px 48px",
              borderTop: `4px solid ${tqColors.primary}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Key
            </div>
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 48,
                fontWeight: 900,
                color: tqColors.primary,
              }}
            >
              K
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 13,
                color: tqColors.mutedForeground,
                opacity: labelSpring,
              }}
            >
              index / label
            </div>
          </div>
        </div>

        {/* Connector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            opacity: connectorSpring,
          }}
        >
          <div
            style={{
              width: interpolate(connectorSpring, [0, 1], [0, 60]),
              height: 2,
              backgroundColor: tqColors.border,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `10px solid ${tqColors.border}`,
            }}
          />
        </div>

        {/* Value box */}
        <div
          style={{
            opacity: valueSpring,
            transform: `scale(${valueScale})`,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "32px 40px",
              borderTop: `4px solid ${tqColors.accent}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Value
            </div>
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 48,
                fontWeight: 900,
                color: tqColors.accent,
              }}
            >
              V
            </div>

            {/* Vector dimensions */}
            <div
              style={{
                display: "flex",
                gap: 6,
                opacity: vectorSpring,
                transform: `translateY(${interpolate(vectorSpring, [0, 1], [10, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  color: tqColors.mutedForeground,
                }}
              >
                [
              </span>
              {vectorDims.map((v, i) => {
                const dimDelay = Math.round(1.5 * fps) + i * 2;
                const dimSpring = spring({
                  frame,
                  fps,
                  config: { damping: 200 },
                  delay: dimDelay,
                });
                return (
                  <span
                    key={i}
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: tqColors.accentLight,
                      opacity: dimSpring,
                    }}
                  >
                    {v.toFixed(2)}
                    {i < vectorDims.length - 1 ? "," : ""}
                  </span>
                );
              })}
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  color: tqColors.mutedForeground,
                }}
              >
                ]
              </span>
            </div>

            <div
              style={{
                fontFamily: inter,
                fontSize: 13,
                color: tqColors.mutedForeground,
                opacity: labelSpring,
              }}
            >
              d-dimensional vector
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
