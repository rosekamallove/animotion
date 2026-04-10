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
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const Implementation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Staggered springs ---
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 0,
  });
  const leftColSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.8 * fps),
  });
  const rightCard1 = spring({
    frame,
    fps,
    config: { damping: 180 },
    delay: Math.round(1.5 * fps),
  });
  const rightCard2 = spring({
    frame,
    fps,
    config: { damping: 180 },
    delay: Math.round(2.0 * fps),
  });
  const rightCard3 = spring({
    frame,
    fps,
    config: { damping: 180 },
    delay: Math.round(2.5 * fps),
  });
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(4.0 * fps),
  });

  // --- Interpolated values ---
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const leftX = interpolate(leftColSpring, [0, 1], [-40, 0]);
  const right1X = interpolate(rightCard1, [0, 1], [60, 0]);
  const right2X = interpolate(rightCard2, [0, 1], [60, 0]);
  const right3X = interpolate(rightCard3, [0, 1], [60, 0]);
  const bottomY = interpolate(bottomSpring, [0, 1], [20, 0]);

  const rightCards = [
    {
      title: "No Retraining Required",
      desc: "Works on any existing model",
      spring: rightCard1,
      x: right1X,
    },
    {
      title: "Model Agnostic",
      desc: "Data-oblivious, pure math",
      spring: rightCard2,
      x: right2X,
    },
    {
      title: "Drop-in Replacement",
      desc: "3 lines of code for HuggingFace",
      spring: rightCard3,
      x: right3X,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          ...gridBackground,
          position: "absolute",
          inset: 0,
          opacity: 0.5,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: montserrat,
            fontWeight: 900,
            fontSize: 48,
            color: tqColors.foreground,
            margin: 0,
          }}
        >
          Can You Use This{" "}
          <span style={{ color: tqColors.primary }}>Right Now?</span>
        </h1>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          bottom: 130,
          display: "flex",
          gap: 40,
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            flex: 1,
            opacity: leftColSpring,
            transform: `translateX(${leftX}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Left column header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <AlertTriangle size={28} color={tqColors.warning} />
            <span
              style={{
                fontFamily: montserrat,
                fontWeight: 700,
                fontSize: 24,
                color: tqColors.warning,
              }}
            >
              The Reality Check
            </span>
          </div>

          {/* Warning card */}
          <div
            style={{
              ...tqGlass,
              borderLeft: `4px solid ${tqColors.warning}`,
              padding: 28,
              borderRadius: 12,
            }}
          >
            <p
              style={{
                fontFamily: inter,
                fontWeight: 600,
                fontSize: 20,
                color: tqColors.foreground,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Research algorithm,{" "}
              <span style={{ color: tqColors.warning }}>not a product yet</span>
            </p>
          </div>

          {/* Code block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontFamily: inter,
                fontWeight: 500,
                fontSize: 14,
                color: tqColors.mutedForeground,
              }}
            >
              Open-source drop-in available
            </span>
            <div
              style={{
                ...tqGlass,
                borderRadius: 10,
                padding: 20,
                border: `1px solid ${tqColors.primary}30`,
                boxShadow: `0 0 20px ${tqColors.primary}15, 0 0 40px ${tqColors.primary}08`,
                opacity: 0.85,
              }}
            >
              <code
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 18,
                  color: tqColors.primary,
                  letterSpacing: 0.5,
                }}
              >
                <span style={{ color: tqColors.mutedForeground }}>$</span>{" "}
                pip install turboquant
              </code>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Right column header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
              opacity: rightCard1,
            }}
          >
            <CheckCircle2 size={28} color={tqColors.success} />
            <span
              style={{
                fontFamily: montserrat,
                fontWeight: 700,
                fontSize: 24,
                color: tqColors.success,
              }}
            >
              The Good News
            </span>
          </div>

          {/* Stacked mini-cards */}
          {rightCards.map((card, i) => (
            <div
              key={i}
              style={{
                ...tqGlass,
                borderLeft: `4px solid ${tqColors.success}`,
                borderRadius: 12,
                padding: 20,
                opacity: card.spring,
                transform: `translateX(${card.x}px)`,
              }}
            >
              <p
                style={{
                  fontFamily: inter,
                  fontWeight: 700,
                  fontSize: 18,
                  color: tqColors.foreground,
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                {card.title}
              </p>
              <p
                style={{
                  fontFamily: inter,
                  fontWeight: 400,
                  fontSize: 15,
                  color: tqColors.mutedForeground,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom banner */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          transform: `translateY(${bottomY}px)`,
        }}
      >
        <p
          style={{
            fontFamily: inter,
            fontWeight: 500,
            fontSize: 18,
            color: tqColors.mutedForeground,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Waiting for{" "}
          <span
            style={{
              color: tqColors.foreground,
              fontWeight: 700,
            }}
          >
            Anthropic
          </span>{" "}
          &amp;{" "}
          <span
            style={{
              color: tqColors.foreground,
              fontWeight: 700,
            }}
          >
            OpenAI
          </span>{" "}
          to bake this into their backends
        </p>
      </div>
    </AbsoluteFill>
  );
};
