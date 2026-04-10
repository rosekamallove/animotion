import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { ChevronDown } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#0f172a",
  foreground: "#e2e8f0",
  primary: "#00d4ff",
  primaryLight: "#38bdf8",
  primaryDark: "#0284c7",
  accent: "#a855f7",
  accentLight: "#c084fc",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  border: "#334155",
  success: "#22c55e",
  destructive: "#ef4444",
  warning: "#f59e0b",
  white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
};

const gridBg: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

const tokens = [
  { text: "The", id: 1892, color: colors.primary },
  { text: "quick", id: 4773, color: colors.accent },
  { text: "brown", id: 2615, color: colors.warning },
  { text: "fox", id: 21831, color: colors.success },
  { text: "jumps", id: 43789, color: colors.destructive },
];

const rawText = "The quick brown fox jumps";

export const LLMTokenisation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Scene Intro (0 - 1.5s)
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(0.2 * fps),
  });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  const subSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.6 * fps),
  });
  const subY = interpolate(subSpring, [0, 1], [20, 0]);

  // Phase 2: Raw Text Reveal (1.5 - 3s)
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
    delay: Math.round(1.5 * fps),
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.7, 1]);

  const typeStart = Math.round(1.8 * fps);
  const typeEnd = Math.round(2.8 * fps);
  const charsVisible = Math.floor(
    interpolate(frame, [typeStart, typeEnd], [0, rawText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Card glow on completion
  const cardGlow = interpolate(
    frame,
    [typeEnd, typeEnd + 10, typeEnd + 20],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Phase 3: Scanner Sweep (3 - 4.2s)
  const scanStart = Math.round(3.0 * fps);
  const scanEnd = Math.round(4.2 * fps);
  const scanProgress = interpolate(frame, [scanStart, scanEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showScanner = frame >= scanStart && frame <= scanEnd;

  // Phase 4: Token Block Explosion (4.2 - 6s)
  const rawCardFadeStart = Math.round(4.2 * fps);
  const rawCardFade = interpolate(
    frame,
    [rawCardFadeStart, rawCardFadeStart + 12],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawCardShrink = interpolate(
    frame,
    [rawCardFadeStart, rawCardFadeStart + 12],
    [1, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const tokenBlockSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 100 },
      delay: Math.round(4.4 * fps) + i * 4,
    })
  );

  // Phase 5: Token ID Assignment (6 - 8s)
  const arrowSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 120 },
      delay: Math.round(6.0 * fps) + i * 4,
    })
  );

  const idCounterStart = Math.round(6.5 * fps);
  const idCounterEnd = Math.round(7.5 * fps);

  // Phase 6: Token Count Badge (8 - 10s)
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.8 },
    delay: Math.round(8.0 * fps),
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.3, 1]);
  const badgeY = interpolate(badgeSpring, [0, 1], [50, 0]);

  // Pulse for badge
  const pulsePhase = frame >= Math.round(8.5 * fps);
  const badgePulse = pulsePhase
    ? interpolate(
        Math.sin((frame - Math.round(8.5 * fps)) * 0.12),
        [-1, 1],
        [1.0, 1.04]
      )
    : 1;

  // Token block pulse in phase 6
  const tokenPulse = pulsePhase
    ? interpolate(
        Math.sin((frame - Math.round(8.5 * fps)) * 0.12),
        [-1, 1],
        [1.0, 1.03]
      )
    : 1;

  const showRawCard = rawCardFade > 0.01;
  const showTokenBlocks = frame >= Math.round(4.4 * fps);

  // Glow pulse for scanner
  const glowPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.6 }} />

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
          padding: "60px 100px",
        }}
      >
        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontSize: 56,
              fontWeight: 900,
              color: colors.foreground,
              opacity: titleSpring,
              transform: `translateY(${titleY}px)`,
              textShadow: `0 0 30px ${colors.primary}20`,
            }}
          >
            How Tokenisation Works
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 20,
              fontWeight: 400,
              color: colors.mutedForeground,
              opacity: subSpring,
              transform: `translateY(${subY}px)`,
            }}
          >
            Breaking text into model-readable units
          </div>
        </div>

        {/* Raw Text Card */}
        {showRawCard && (
          <div
            style={{
              ...glass,
              padding: "36px 60px",
              opacity: rawCardFade,
              transform: `scale(${cardScale * rawCardShrink})`,
              borderColor: `rgba(0, 212, 255, ${0.1 + cardGlow * 0.4})`,
              boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 ${
                20 * cardGlow
              }px ${colors.primary}40`,
              position: "relative",
              overflow: "hidden",
              minWidth: 700,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: 40,
                fontWeight: 600,
                color: colors.foreground,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              {rawText.slice(0, charsVisible)}
              {charsVisible < rawText.length && (
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: 40,
                    backgroundColor: colors.primary,
                    marginLeft: 2,
                    verticalAlign: "middle",
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0.3,
                  }}
                />
              )}
            </div>

            {/* Scanner Laser */}
            {showScanner && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  bottom: 8,
                  left: `${interpolate(scanProgress, [0, 1], [0, 100])}%`,
                  width: 2,
                  backgroundColor: colors.primary,
                  boxShadow: `0 0 ${12 * glowPulse}px ${colors.primary}, 0 0 ${24 * glowPulse}px ${colors.primary}60`,
                  zIndex: 10,
                }}
              />
            )}
          </div>
        )}

        {/* Token Blocks Row */}
        {showTokenBlocks && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Token blocks */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {tokens.map((token, i) => {
                const s = tokenBlockSprings[i];
                const scale = interpolate(s, [0, 1], [0, 1]);
                const y = interpolate(s, [0, 1], [40, 0]);

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      opacity: s,
                      transform: `scale(${scale * tokenPulse}) translateY(${y}px)`,
                    }}
                  >
                    <div
                      style={{
                        ...glass,
                        padding: "20px 28px",
                        borderTop: `4px solid ${token.color}`,
                        background: `linear-gradient(135deg, ${token.color}15, ${token.color}08)`,
                        minWidth: 100,
                        textAlign: "center",
                        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 ${
                          8 * glowPulse
                        }px ${token.color}20`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            "'SF Mono', 'Fira Code', 'Courier New', monospace",
                          fontSize: 26,
                          fontWeight: 700,
                          color: colors.white,
                        }}
                      >
                        {token.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Arrows Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {tokens.map((token, i) => {
                const aS = arrowSprings[i];
                const arrowScale = interpolate(aS, [0, 1], [0, 1]);

                return (
                  <div
                    key={i}
                    style={{
                      minWidth: 100,
                      display: "flex",
                      justifyContent: "center",
                      opacity: aS,
                      transform: `scale(${arrowScale})`,
                    }}
                  >
                    <ChevronDown
                      size={28}
                      color={token.color}
                      strokeWidth={2.5}
                    />
                  </div>
                );
              })}
            </div>

            {/* Token IDs Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {tokens.map((token, i) => {
                const idDelay = idCounterStart + i * 3;
                const idEnd = idCounterEnd + i * 3;
                const idProgress = interpolate(
                  frame,
                  [idDelay, idEnd],
                  [0, token.id],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const idOpacity = interpolate(
                  frame,
                  [idDelay, idDelay + 5],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                  <div
                    key={i}
                    style={{
                      minWidth: 100,
                      textAlign: "center",
                      opacity: idOpacity,
                    }}
                  >
                    <div
                      style={{
                        fontFamily:
                          "'SF Mono', 'Fira Code', 'Courier New', monospace",
                        fontSize: 18,
                        fontWeight: 700,
                        color: token.color,
                        textShadow: `0 0 8px ${token.color}40`,
                      }}
                    >
                      {Math.round(idProgress)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Token Count Badge */}
        {badgeSpring > 0.01 && (
          <div
            style={{
              marginTop: 16,
              opacity: badgeSpring,
              transform: `scale(${badgeScale * badgePulse}) translateY(${badgeY}px)`,
            }}
          >
            <div
              style={{
                ...glass,
                padding: "14px 40px",
                borderRadius: 50,
                border: `2px solid ${colors.primary}80`,
                boxShadow: `0 0 ${16 * glowPulse}px ${colors.primary}30, 0 4px 24px rgba(0, 0, 0, 0.3)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontFamily: montserrat,
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.primary,
                }}
              >
                5
              </div>
              <div
                style={{
                  fontFamily: montserrat,
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.foreground,
                }}
              >
                Tokens
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};