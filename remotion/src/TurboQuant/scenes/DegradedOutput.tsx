import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// The prompt
const PROMPT = "Refactor the auth middleware to use the new session token storage";

// Good output (first ~3 seconds of typing)
const GOOD_OUTPUT = `Sure! I'll refactor the auth middleware. Here's the updated implementation:

1. Replace the old cookie-based session with the new encrypted token store
2. Update the middleware chain to validate tokens against the new schema
3. Add the refresh token rotation logic in /lib/auth/`;

// Degraded output (starts after the "swap")
const BAD_OUTPUT = `4. Update the the the middleware to handle
5. The session token is stored in the the cookie and the
6. Make sure to update the the the auth config to use
7. The middleware should validate the the the...
8. Refactor the auth the auth the auth`;

// Warning badges that pop in
const warnings = [
  { text: "Context Lost", delay: 5.5, x: 72, y: 30 },
  { text: "Hallucinating", delay: 6.5, x: 55, y: 55 },
  { text: "Forgot Instructions", delay: 7.5, x: 68, y: 78 },
];

export const DegradedOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Prompt appears
  const promptSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.3 * fps),
  });

  // Good output types character by character (fast: ~2 chars/frame)
  const goodStart = Math.round(0.8 * fps);
  const goodEnd = Math.round(3.0 * fps);
  const goodChars = Math.floor(
    interpolate(frame, [goodStart, goodEnd], [0, GOOD_OUTPUT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Slowdown phase — cursor blinks, typing slows dramatically
  const slowStart = Math.round(3.5 * fps);
  const slowEnd = Math.round(7.5 * fps);
  const badChars = Math.floor(
    interpolate(frame, [slowStart, slowEnd], [0, BAD_OUTPUT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Cursor blink — fast when typing, slow blink when stalling
  const isTypingGood = frame >= goodStart && frame < goodEnd;
  const isTypingBad = frame >= slowStart && frame < slowEnd;
  const isStalling = frame >= goodEnd && frame < slowStart;

  let cursorVisible = true;
  if (isStalling) {
    // Slow blink during stall
    cursorVisible = Math.sin(frame * 0.15) > 0;
  } else if (isTypingGood || isTypingBad) {
    // Fast blink while typing
    cursorVisible = Math.sin(frame * 0.5) > -0.3;
  }

  // "Slowing down..." indicator
  const slowIndicator = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.2 * fps),
  });

  // Speed indicator
  const tokensPerSec = isTypingGood
    ? interpolate(frame, [goodStart, goodEnd], [45, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : isStalling
      ? interpolate(frame, [goodEnd, slowStart], [45, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : isTypingBad
        ? interpolate(frame, [slowStart, slowEnd], [3, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 0;

  const speedSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.8 * fps),
  });

  // Warning badges
  const warningBadgeSprings = warnings.map((w) =>
    spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 140 },
      delay: Math.round(w.delay * fps),
    }),
  );

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(8.5 * fps),
  });

  // Build the visible text
  const goodText = GOOD_OUTPUT.slice(0, goodChars);
  const badText = BAD_OUTPUT.slice(0, badChars);
  const showBad = frame >= slowStart;

  // Red tint on the bad part
  const badOpacity = interpolate(
    frame,
    [slowStart, slowStart + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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

      {/* Speed indicator — top right */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 50,
          opacity: speedSpring,
          zIndex: 3,
        }}
      >
        <div style={{ ...tqGlass, padding: "12px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: tqColors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Tokens/sec
          </div>
          <div
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: tokensPerSec > 20
                ? tqColors.success
                : tokensPerSec > 5
                  ? tqColors.warning
                  : tqColors.destructive,
            }}
          >
            {tokensPerSec.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Terminal window */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 50,
          right: 200,
          bottom: 70,
          zIndex: 1,
        }}
      >
        <div
          style={{
            ...tqGlass,
            height: "100%",
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: `1px solid ${tqColors.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span style={{ fontSize: 13, color: tqColors.mutedForeground, marginLeft: 12 }}>
              AI Assistant
            </span>
          </div>

          {/* Terminal body */}
          <div style={{ flex: 1, padding: "20px 24px", overflow: "hidden" }}>
            {/* Prompt */}
            <div
              style={{
                opacity: promptSpring,
                marginBottom: 16,
              }}
            >
              <span style={{ color: tqColors.primary, fontWeight: 700, fontSize: 14 }}>{">"} </span>
              <span style={{ color: tqColors.foreground, fontSize: 14 }}>{PROMPT}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: tqColors.border, marginBottom: 16, opacity: 0.3 }} />

            {/* Good output */}
            <div style={{ position: "relative" }}>
              <pre
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: tqColors.foreground,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {goodText}
                {showBad && (
                  <span style={{ color: interpolate(badOpacity, [0, 1], [0.88, 1]) > 0.5 ? tqColors.destructive : tqColors.foreground, opacity: 0.7 + badOpacity * 0.3 }}>
                    {"\n"}{badText}
                  </span>
                )}
                {cursorVisible && (
                  <span
                    style={{
                      backgroundColor: isStalling || (showBad && tokensPerSec < 5)
                        ? tqColors.destructive
                        : tqColors.primary,
                      width: 8,
                      height: 18,
                      display: "inline-block",
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </pre>

              {/* "Slowing down" overlay */}
              {isStalling && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: slowIndicator * 0.9,
                  }}
                >
                  <div
                    style={{
                      ...tqGlass,
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: `1px solid ${tqColors.warning}40`,
                      fontSize: 13,
                      fontWeight: 700,
                      color: tqColors.warning,
                    }}
                  >
                    Swapping to system memory...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning badges — float over the terminal */}
      {warnings.map((w, i) => {
        const s = warningBadgeSprings[i];
        const scale = interpolate(s, [0, 1], [0.3, 1]);
        const pulse = interpolate(Math.sin(frame * 0.12 + i), [-1, 1], [0.7, 1]);
        return (
          <div
            key={w.text}
            style={{
              position: "absolute",
              left: `${w.x}%`,
              top: `${w.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: s,
              zIndex: 4,
            }}
          >
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                backgroundColor: `${tqColors.destructive}20`,
                border: `1.5px solid ${tqColors.destructive}80`,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 13,
                fontWeight: 700,
                color: tqColors.destructive,
                boxShadow: `0 0 ${12 * pulse}px ${tqColors.destructive}40`,
                whiteSpace: "nowrap",
              }}
            >
              {w.text}
            </div>
          </div>
        );
      })}

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
        <span style={{ fontSize: 17, fontWeight: 600, color: tqColors.mutedForeground }}>
          The AI forgets your architecture.{" "}
          <span style={{ color: tqColors.destructive, fontWeight: 700 }}>The output becomes unusable.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
