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
import { Database } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const tokens = ["The", "cat", "sat", "on", "the", "mat", "."];

export const KVCacheMemory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- WITHOUT cache (left side, 0-5s) ---
  const withoutLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });

  // Each token generation step — shows ALL previous tokens being reprocessed
  // Token i appears at staggered times
  const tokenAppearDelays = tokens.map((_, i) =>
    Math.round((0.8 + i * 0.5) * fps),
  );

  const tokenSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: tokenAppearDelays[i],
    }),
  );

  // Current generation step (which token is being generated)
  const currentStep = interpolate(
    frame,
    [Math.round(0.8 * fps), Math.round(4.0 * fps)],
    [0, tokens.length - 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const activeStep = Math.floor(currentStep);

  // --- WITH cache (right side, appears at ~4.5s) ---
  const withLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(4.5 * fps),
  });

  const cacheBoxSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(5.0 * fps),
  });

  // Cache entries fill in
  const cacheSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(5.5 * fps) + i * 3,
    }),
  );

  // "Just lookup" arrow + new token
  const lookupSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(7.5 * fps),
  });

  // Speed comparison
  const speedSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.5 * fps),
  });

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(9.0 * fps),
  });

  // Blinking recompute indicator
  const recomputeBlink = interpolate(
    Math.sin(frame * 0.3),
    [-1, 1],
    [0.3, 1],
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          gap: 40,
          padding: "50px 60px",
          zIndex: 1,
        }}
      >
        {/* LEFT: Without KV Cache */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            opacity: withoutLabelSpring,
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 22,
              fontWeight: 900,
              color: tqColors.destructive,
              marginBottom: 20,
              textAlign: "center",
              opacity: withoutLabelSpring,
            }}
          >
            Without KV Cache
          </div>

          {/* Generation steps */}
          <div
            style={{
              ...tqGlass,
              flex: 1,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              To generate each new word:
            </div>

            {tokens.map((token, i) => {
              const s = tokenSprings[i];
              const isActive = i === activeStep && frame < Math.round(4.5 * fps);

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [20, 0])}px)`,
                  }}
                >
                  {/* Step label */}
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: tqColors.mutedForeground,
                      width: 20,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}.
                  </span>

                  {/* All tokens up to this point must be reprocessed */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {tokens.slice(0, i).map((prevToken, j) => (
                      <span
                        key={j}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: `${tqColors.destructive}15`,
                          border: `1px solid ${tqColors.destructive}30`,
                          fontSize: 12,
                          fontWeight: 600,
                          color: tqColors.destructive,
                          opacity: isActive ? recomputeBlink : 0.5,
                        }}
                      >
                        {prevToken}
                      </span>
                    ))}
                    {/* New token */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: `${tqColors.warning}20`,
                        border: `1px solid ${tqColors.warning}50`,
                        fontSize: 12,
                        fontWeight: 700,
                        color: tqColors.warning,
                      }}
                    >
                      {token}
                    </span>
                  </div>

                  {/* Recompute label */}
                  {i > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: tqColors.destructive,
                        opacity: 0.6,
                        marginLeft: "auto",
                        flexShrink: 0,
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                      }}
                    >
                      recompute {i} token{i > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Total waste indicator */}
            <div
              style={{
                marginTop: "auto",
                padding: "8px 14px",
                borderRadius: 6,
                backgroundColor: `${tqColors.destructive}12`,
                border: `1px solid ${tqColors.destructive}30`,
                textAlign: "center",
                opacity: tokenSprings[tokens.length - 1] ?? 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: tqColors.destructive,
                }}
              >
                {tokens.length * (tokens.length - 1) / 2} redundant computations
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            backgroundColor: tqColors.border,
            opacity: withLabelSpring * 0.5,
            alignSelf: "stretch",
            marginTop: 50,
          }}
        />

        {/* RIGHT: With KV Cache */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            opacity: withLabelSpring,
            transform: `translateX(${interpolate(withLabelSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 22,
              fontWeight: 900,
              color: tqColors.success,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            With KV Cache
          </div>

          <div
            style={{
              ...tqGlass,
              flex: 1,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              borderTop: `3px solid ${tqColors.success}`,
              opacity: cacheBoxSpring,
              transform: `scale(${interpolate(cacheBoxSpring, [0, 1], [0.9, 1])})`,
            }}
          >
            {/* Cache storage */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Database size={18} color={tqColors.primary} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: tqColors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Stored in memory (KV Cache)
              </span>
            </div>

            {/* Cached tokens */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tokens.slice(0, -1).map((token, i) => {
                const cs = cacheSprings[i];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: cs,
                      transform: `translateX(${interpolate(cs, [0, 1], [15, 0])}px)`,
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        backgroundColor: `${tqColors.primary}15`,
                        border: `1px solid ${tqColors.primary}30`,
                        fontSize: 13,
                        fontWeight: 600,
                        color: tqColors.primary,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      {token}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: tqColors.primary,
                          opacity: 0.6,
                        }}
                      />
                      <span style={{ fontSize: 10, color: tqColors.mutedForeground, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                        K
                      </span>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: tqColors.accent,
                          opacity: 0.6,
                        }}
                      />
                      <span style={{ fontSize: 10, color: tqColors.mutedForeground, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                        V
                      </span>
                      <span style={{ fontSize: 10, color: tqColors.success, fontWeight: 600, marginLeft: 4 }}>
                        cached
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lookup arrow + new token */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: lookupSpring,
                transform: `scale(${interpolate(lookupSpring, [0, 1], [0.5, 1])})`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  borderRadius: 8,
                  backgroundColor: `${tqColors.success}15`,
                  border: `1.5px solid ${tqColors.success}40`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: tqColors.mutedForeground }}>
                  Generate next:
                </span>
                <span
                  style={{
                    padding: "3px 12px",
                    borderRadius: 4,
                    backgroundColor: `${tqColors.warning}20`,
                    border: `1px solid ${tqColors.warning}50`,
                    fontSize: 14,
                    fontWeight: 700,
                    color: tqColors.warning,
                  }}
                >
                  {tokens[tokens.length - 1]}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tqColors.success }}>
                  only compute 1 token
                </span>
              </div>
            </div>

            {/* Speed comparison */}
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                backgroundColor: `${tqColors.success}12`,
                border: `1px solid ${tqColors.success}30`,
                textAlign: "center",
                opacity: speedSpring,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: tqColors.success,
                }}
              >
                0 redundant computations
              </span>
            </div>
          </div>
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
          The KV cache is the model's{" "}
          <span style={{ color: tqColors.primary, fontWeight: 700 }}>short-term memory</span>
          {" "} — store once, reuse forever.
        </span>
      </div>
    </AbsoluteFill>
  );
};
