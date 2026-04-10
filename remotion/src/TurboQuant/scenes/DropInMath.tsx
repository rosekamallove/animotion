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
import { ArrowRight, X } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const DropInMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Existing pipeline appears (0-2s)
  const pipelineSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });

  const boxSprings = [0, 1, 2].map((i) =>
    spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 100 },
      delay: Math.round((0.5 + i * 0.4) * fps),
    }),
  );

  const arrowSprings = [0, 1].map((i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round((0.8 + i * 0.4) * fps),
    }),
  );

  // Phase 2: Gap opens between KV Cache and Output (2.5s)
  const gapSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
    delay: Math.round(2.5 * fps),
  });
  // gapSpring drives the width of the TurboQuant slot inline

  // Phase 3: TurboQuant drops in from above (3.2s)
  const dropSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
    delay: Math.round(3.2 * fps),
  });
  const dropY = interpolate(dropSpring, [0, 1], [-200, 0]);
  const dropScale = interpolate(dropSpring, [0, 1], [0.6, 1]);

  // New arrows connecting TurboQuant
  const newArrowSprings = [0, 1].map((i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round((4.0 + i * 0.3) * fps),
    }),
  );

  // Phase 4: "No retraining" badges (5s)
  const noRetrainSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(5.0 * fps),
  });

  // Phase 5: Three benefit pills (6-7s)
  const pillSprings = [0, 1, 2].map((i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round((6.0 + i * 0.4) * fps),
    }),
  );

  // Formula
  const formulaSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(7.5 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.5 * fps),
  });

  // Glow pulse on TurboQuant box
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          gap: 32,
        }}
      >
        {/* Pipeline row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            opacity: pipelineSpring,
          }}
        >
          {/* LLM */}
          <div style={{ opacity: boxSprings[0], transform: `scale(${interpolate(boxSprings[0], [0, 1], [0.5, 1])})` }}>
            <div style={{ ...tqGlass, padding: "28px 36px", borderTop: `3px solid ${tqColors.primary}`, textAlign: "center", minWidth: 180 }}>
              <div style={{ fontFamily: montserrat, fontSize: 22, fontWeight: 900, color: tqColors.primary }}>LLM</div>
              <div style={{ fontSize: 13, color: tqColors.mutedForeground, marginTop: 6 }}>Any model</div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div style={{ opacity: arrowSprings[0], padding: "0 16px" }}>
            <ArrowRight size={24} color={tqColors.mutedForeground} />
          </div>

          {/* KV Cache */}
          <div style={{ opacity: boxSprings[1], transform: `scale(${interpolate(boxSprings[1], [0, 1], [0.5, 1])})` }}>
            <div style={{ ...tqGlass, padding: "28px 36px", borderTop: `3px solid ${tqColors.accent}`, textAlign: "center", minWidth: 180 }}>
              <div style={{ fontFamily: montserrat, fontSize: 22, fontWeight: 900, color: tqColors.accent }}>KV Cache</div>
              <div style={{ fontSize: 13, color: tqColors.mutedForeground, marginTop: 6 }}>16-bit vectors</div>
            </div>
          </div>

          {/* Arrow 2 (before TurboQuant) */}
          <div style={{ opacity: arrowSprings[1], padding: "0 16px" }}>
            <ArrowRight size={24} color={dropSpring > 0.5 ? tqColors.success : tqColors.mutedForeground} />
          </div>

          {/* TurboQuant — drops in from above, inline in the flow */}
          <div
            style={{
              overflow: "hidden",
              width: interpolate(gapSpring, [0, 1], [0, 220]),
            }}
          >
            <div
              style={{
                opacity: dropSpring,
                transform: `translateY(${dropY}px) scale(${dropScale})`,
                width: 220,
              }}
            >
              <div
                style={{
                  ...tqGlass,
                  padding: "28px 36px",
                  borderTop: `3px solid ${tqColors.success}`,
                  textAlign: "center",
                  boxShadow: `0 0 ${24 * glowPulse}px ${tqColors.success}30, 0 8px 32px rgba(0,0,0,0.4)`,
                }}
              >
                <div style={{ fontFamily: montserrat, fontSize: 20, fontWeight: 900, color: tqColors.success }}>TurboQuant</div>
                <div style={{ fontSize: 12, color: tqColors.mutedForeground, marginTop: 6 }}>compress KV cache</div>
              </div>
            </div>
          </div>

          {/* Arrow 3 (after TurboQuant) */}
          <div
            style={{
              overflow: "hidden",
              width: interpolate(gapSpring, [0, 1], [0, 56]),
            }}
          >
            <div style={{ opacity: newArrowSprings[1], padding: "0 16px", width: 56 }}>
              <ArrowRight size={24} color={tqColors.success} />
            </div>
          </div>

          {/* Output */}
          <div style={{ opacity: boxSprings[2], transform: `scale(${interpolate(boxSprings[2], [0, 1], [0.5, 1])})` }}>
            <div style={{ ...tqGlass, padding: "28px 36px", borderTop: `3px solid ${tqColors.foreground}`, textAlign: "center", minWidth: 180 }}>
              <div style={{ fontFamily: montserrat, fontSize: 22, fontWeight: 900, color: tqColors.foreground }}>Output</div>
              <div style={{ fontSize: 13, color: tqColors.mutedForeground, marginTop: 6 }}>Generated text</div>
            </div>
          </div>
        </div>

        {/* "No Retraining Required" badge with crossed-out training icon */}
        <div
          style={{
            opacity: noRetrainSpring,
            transform: `scale(${interpolate(noRetrainSpring, [0, 1], [0.3, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Crossed out training loop */}
          <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={48} height={48} viewBox="0 0 48 48">
              {/* Training loop circle */}
              <circle
                cx={24}
                cy={24}
                r={16}
                fill="none"
                stroke={tqColors.mutedForeground}
                strokeWidth={2}
                strokeDasharray="8 4"
                opacity={0.4}
              />
              {/* Arrow on the loop */}
              <path
                d="M 36 20 L 40 24 L 36 28"
                fill="none"
                stroke={tqColors.mutedForeground}
                strokeWidth={2}
                opacity={0.4}
              />
            </svg>
            {/* Red X over it */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={36} color={tqColors.destructive} strokeWidth={3} />
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: montserrat,
                fontSize: 22,
                fontWeight: 900,
                color: tqColors.foreground,
              }}
            >
              No Retraining Required
            </div>
            <div style={{ fontSize: 14, color: tqColors.mutedForeground, marginTop: 2 }}>
              Works on any existing model — drop it in and go
            </div>
          </div>
        </div>

        {/* Three benefit pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Data-oblivious", sub: "Doesn't depend on training data" },
            { label: "Model-agnostic", sub: "LLaMA, GPT, Claude — any model" },
            { label: "Pure math", sub: "Random rotations, not learned weights" },
          ].map((pill, i) => (
            <div
              key={i}
              style={{
                ...tqGlass,
                padding: "14px 24px",
                borderLeft: `3px solid ${tqColors.success}`,
                opacity: pillSprings[i],
                transform: `translateY(${interpolate(pillSprings[i], [0, 1], [15, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: tqColors.foreground }}>
                {pill.label}
              </div>
              <div style={{ fontSize: 12, color: tqColors.mutedForeground, marginTop: 4 }}>
                {pill.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Formula */}
        <div
          style={{
            opacity: formulaSpring,
            transform: `translateY(${interpolate(formulaSpring, [0, 1], [10, 0])}px)`,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 16,
            color: tqColors.mutedForeground,
          }}
        >
          It's just a{" "}
          <span style={{ color: tqColors.success, fontWeight: 700 }}>mathematical equation</span>
          {" "}at the end of the day.
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
          transform: `translateY(${interpolate(bottomSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: tqColors.mutedForeground }}>
          No new data. No fine-tuning. Just{" "}
          <span style={{ color: tqColors.success, fontWeight: 700 }}>plug it into any existing workflow.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
