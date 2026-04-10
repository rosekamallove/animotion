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
import { Check, X } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const timelineMessages = [
  { label: "System prompt", short: "Use Next.js App Router. No pages dir." },
  { label: "Architecture", short: "Auth via middleware, not API routes." },
  { label: "Context", short: "We use Drizzle ORM with Postgres." },
  { label: "...", short: "50+ messages of back and forth" },
  { label: "Edge case", short: "Handle token refresh in parallel requests." },
  { label: "Current", short: "" },
];

export const VRAMRetention: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- BEFORE section (top, 0-5s) ---
  const beforeLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });

  const beforeMsgSprings = timelineMessages.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(0.5 * fps) + i * 4,
    }),
  );

  // Broken connection line draws then breaks
  const brokenLineSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
  });

  // Bad output appears
  const badOutputSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(2.5 * fps),
  });

  // --- AFTER section (bottom, 4.5-10s) ---
  const afterLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(4.5 * fps),
  });

  const afterMsgSprings = timelineMessages.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(5.0 * fps) + i * 4,
    }),
  );

  // Green connection line draws across
  const greenLineProgress = interpolate(
    frame,
    [Math.round(6.0 * fps), Math.round(7.5 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Good output
  const goodOutputSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: Math.round(7.5 * fps),
  });

  // "Still in VRAM" badges
  const vramBadgeSprings = timelineMessages.slice(0, -1).map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 200 },
      delay: Math.round(7.0 * fps) + i * 3,
    }),
  );

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(9.0 * fps),
  });

  // Pulse for the green line glow
  const greenPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1]);

  const MSG_WIDTH = 220;
  const MSG_GAP = 24;
  const TIMELINE_LEFT = 60;

  const renderTimeline = (
    isBefore: boolean,
    msgSprings: number[],
    lineProgress: number | null,
    outputSpring: number,
  ) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
        }}
      >
        {/* Timeline bar */}
        <div
          style={{
            position: "relative",
            height: 4,
            marginLeft: TIMELINE_LEFT,
            marginRight: 60,
            marginBottom: 8,
          }}
        >
          {/* Base line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 4,
              borderRadius: 2,
              backgroundColor: tqColors.muted,
            }}
          />

          {/* Connection line */}
          {isBefore ? (
            <>
              {/* Broken red dashed line */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: `${brokenLineSpring * 40}%`,
                  top: 0,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: tqColors.destructive,
                  opacity: 0.6,
                }}
              />
              {/* Gap */}
              <div
                style={{
                  position: "absolute",
                  left: "42%",
                  width: "16%",
                  top: 0,
                  height: 4,
                  borderRadius: 2,
                  background: `repeating-linear-gradient(90deg, ${tqColors.destructive}40 0px, ${tqColors.destructive}40 6px, transparent 6px, transparent 12px)`,
                  opacity: brokenLineSpring,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "60%",
                  width: `${brokenLineSpring * 40}%`,
                  top: 0,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: tqColors.destructive,
                  opacity: 0.3,
                }}
              />
            </>
          ) : (
            /* Solid green line drawing across */
            <div
              style={{
                position: "absolute",
                left: 0,
                width: `${(lineProgress ?? 0) * 100}%`,
                top: 0,
                height: 4,
                borderRadius: 2,
                backgroundColor: tqColors.success,
                boxShadow: `0 0 ${10 * greenPulse}px ${tqColors.success}60`,
              }}
            />
          )}
        </div>

        {/* Messages row */}
        <div
          style={{
            display: "flex",
            gap: MSG_GAP,
            marginLeft: TIMELINE_LEFT,
          }}
        >
          {timelineMessages.map((msg, i) => {
            const s = msgSprings[i];
            const isLast = i === timelineMessages.length - 1;
            const isEarly = i < 3;

            // Before: early messages fade out
            const msgOpacity = isBefore && isEarly
              ? interpolate(s, [0, 1], [0, 0.3])
              : s;

            if (isLast) {
              // Output card
              return (
                <div
                  key={i}
                  style={{
                    width: MSG_WIDTH,
                    opacity: outputSpring,
                    transform: `scale(${interpolate(outputSpring, [0, 1], [0.5, 1])})`,
                  }}
                >
                  <div
                    style={{
                      ...tqGlass,
                      padding: "10px 14px",
                      borderTop: `3px solid ${isBefore ? tqColors.destructive : tqColors.success}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      {isBefore ? (
                        <X size={14} color={tqColors.destructive} strokeWidth={3} />
                      ) : (
                        <Check size={14} color={tqColors.success} strokeWidth={3} />
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isBefore ? tqColors.destructive : tqColors.success,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {isBefore ? "Output" : "Output"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: 11,
                        lineHeight: 1.5,
                        color: isBefore ? tqColors.destructive : tqColors.success,
                      }}
                    >
                      {isBefore
                        ? "Uses pages/ dir, puts auth in API route..."
                        : "Uses App Router, auth in middleware, Drizzle + Postgres"}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                style={{
                  width: msg.label === "..." ? 100 : MSG_WIDTH,
                  opacity: msgOpacity,
                  transform: `translateY(${interpolate(Math.min(s, 1), [0, 1], [10, 0])}px)`,
                }}
              >
                <div
                  style={{
                    ...tqGlass,
                    padding: msg.label === "..." ? "8px 12px" : "10px 14px",
                    borderRadius: 10,
                    borderLeft: `3px solid ${
                      isBefore && isEarly
                        ? tqColors.border
                        : isEarly
                          ? tqColors.primary
                          : tqColors.border
                    }`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: tqColors.mutedForeground,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    {msg.label}
                  </div>
                  {msg.short && (
                    <div
                      style={{
                        fontSize: 11,
                        color: isBefore && isEarly ? tqColors.mutedForeground : tqColors.foreground,
                        lineHeight: 1.4,
                        opacity: isBefore && isEarly ? 0.5 : 1,
                      }}
                    >
                      {msg.short}
                    </div>
                  )}
                </div>

                {/* "Still in VRAM" badge (after side only, early messages) */}
                {!isBefore && isEarly && (
                  <div
                    style={{
                      marginTop: 6,
                      textAlign: "center",
                      opacity: vramBadgeSprings[i],
                      transform: `scale(${interpolate(vramBadgeSprings[i], [0, 1], [0.5, 1])})`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: tqColors.success,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: `${tqColors.success}15`,
                        border: `1px solid ${tqColors.success}30`,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      in VRAM
                    </span>
                  </div>
                )}

                {/* "Forgotten" badge (before side, early messages) */}
                {isBefore && isEarly && i < 3 && (
                  <div
                    style={{
                      marginTop: 6,
                      textAlign: "center",
                      opacity: brokenLineSpring > 0.5 ? 0.7 : 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: tqColors.destructive,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: `${tqColors.destructive}15`,
                        border: `1px solid ${tqColors.destructive}30`,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      forgotten
                    </span>
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
          top: 30,
          left: 0,
          right: 0,
          bottom: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 40,
          zIndex: 1,
        }}
      >
        {/* BEFORE */}
        <div style={{ opacity: beforeLabelSpring }}>
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 18,
              fontWeight: 900,
              color: tqColors.destructive,
              marginBottom: 12,
              marginLeft: TIMELINE_LEFT,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <X size={18} color={tqColors.destructive} strokeWidth={3} />
            Without compression — cache swapped out of VRAM
          </div>
          {renderTimeline(true, beforeMsgSprings, null, badOutputSpring)}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: tqColors.border,
            marginLeft: TIMELINE_LEFT,
            marginRight: 60,
            opacity: afterLabelSpring * 0.4,
          }}
        />

        {/* AFTER */}
        <div
          style={{
            opacity: afterLabelSpring,
            transform: `translateY(${interpolate(afterLabelSpring, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 18,
              fontWeight: 900,
              color: tqColors.success,
              marginBottom: 12,
              marginLeft: TIMELINE_LEFT,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Check size={18} color={tqColors.success} strokeWidth={3} />
            With 6x compression — entire cache stays in VRAM
          </div>
          {renderTimeline(false, afterMsgSprings, greenLineProgress, goodOutputSpring)}
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          transform: `translateY(${interpolate(bottomSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: tqColors.mutedForeground }}>
          Your first instruction still matters at message 500.{" "}
          <span style={{ color: tqColors.success, fontWeight: 700 }}>
            Less hallucination. Better output.
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
