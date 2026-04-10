import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Scissors, ArrowDown, Zap, Trophy } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#fdf4ff",
  foreground: "#1e1b4b",
  primary: "#ec4899",
  primaryLight: "#f472b6",
  primaryDark: "#db2777",
  accent: "#f97316",
  accentLight: "#fb923c",
  muted: "#fce7f3",
  mutedForeground: "#6b7280",
  border: "#fbcfe8",
  success: "#14b8a6",
  destructive: "#ef4444",
  warning: "#f59e0b",
  white: "#ffffff",
};

const _glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "3px solid rgba(236, 72, 153, 0.15)",
  borderRadius: 24,
  boxShadow: "0 4px 20px rgba(236, 72, 153, 0.08)",
};

const blueShades = ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8", "#1e40af"];
const tokens = ["The", "cat", "sat", "on", "the", "mat"];
const tokenIds = [464, 5, 910, 319, 262, 3096];

export const LlmTokenizationExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1End = Math.round(2.5 * fps);
  const phase2End = Math.round(5.5 * fps);
  const phase3End = Math.round(8.5 * fps);
  const phase4End = Math.round(11.5 * fps);

  const currentPhase = frame < phase1End ? 1 : frame < phase2End ? 2 : frame < phase3End ? 3 : frame < phase4End ? 4 : 5;

  const labelTexts = ["TOKENIZATION", "TOKENIZATION", "TOKEN IDs", "EMBEDDINGS", "BPE vs WORD-LEVEL"];
  const labelText = labelTexts[currentPhase - 1];

  const labelSpring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(0.1 * fps) });
  const labelScale = interpolate(labelSpring, [0, 1], [0.3, 1]);
  const labelY = interpolate(labelSpring, [0, 1], [-60, 0]);

  const sentenceSpring = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, delay: Math.round(0.6 * fps) });
  const sentenceScale = interpolate(sentenceSpring, [0, 1], [0.3, 1]);
  const sentenceRotate = interpolate(sentenceSpring, [0, 1], [-5, 0]);

  const underlineProgress = interpolate(frame, [Math.round(1.0 * fps), Math.round(1.8 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sentenceFadeOut = currentPhase >= 2 ? interpolate(frame, [phase1End, phase1End + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const phase2to3Fade = currentPhase >= 4 ? interpolate(frame, [phase3End - 10, phase3End], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const phase4Fade = currentPhase >= 5 ? interpolate(frame, [phase4End - 10, phase4End], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const phase5Visible = currentPhase === 5;

  // Reference _glass to avoid unused warning
  void _glass;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      {/* Scene Label */}
      <div style={{
        position: "absolute",
        top: 40,
        left: "50%",
        transform: `translateX(-50%) scale(${labelScale}) translateY(${labelY}px)`,
        opacity: labelSpring,
        zIndex: 100,
      }}>
        <div style={{
          background: colors.primary,
          color: colors.white,
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: 22,
          padding: "12px 36px",
          borderRadius: 50,
          border: `3px solid ${colors.primaryDark}`,
          boxShadow: `0 4px 20px ${colors.primary}40`,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}>
          {labelText}
        </div>
      </div>

      {/* Phase 1: Sentence Intro */}
      {currentPhase <= 2 && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: sentenceFadeOut,
          zIndex: 10,
        }}>
          <div style={{
            transform: `scale(${sentenceScale}) rotate(${sentenceRotate}deg)`,
            opacity: sentenceSpring,
          }}>
            <div style={{
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: 88,
              color: colors.foreground,
              textAlign: "center",
              lineHeight: 1.2,
            }}>
              The cat sat on the mat
            </div>
            <div style={{
              width: `${underlineProgress * 100}%`,
              height: 6,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: 3,
              marginTop: 12,
            }} />
          </div>
        </div>
      )}

      {/* Phase 2: Token Split */}
      {(currentPhase === 2 || currentPhase === 3) && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          opacity: phase2to3Fade,
        }}>
          {/* Scissors icon */}
          {currentPhase === 2 && (() => {
            const scissorSpring = spring({ frame, fps, config: { damping: 12, stiffness: 150 }, delay: phase1End + 2 });
            return (
              <div style={{
                opacity: scissorSpring,
                transform: `scale(${interpolate(scissorSpring, [0, 1], [0.3, 1])})`,
                marginBottom: 30,
              }}>
                <Scissors size={40} color={colors.primary} />
              </div>
            );
          })()}

          {/* Token pills row */}
          <div style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {tokens.map((token, i) => {
                const delay = phase1End + 8 + i * 5;
                const tokenSpring = spring({ frame, fps, config: { damping: 10, stiffness: 160 }, delay });
                const scale = interpolate(tokenSpring, [0, 1], [0.3, 1]);
                const rotation = interpolate(tokenSpring, [0, 1], [i % 2 === 0 ? -8 : 8, 0]);

                return (
                  <div key={i} style={{
                    opacity: tokenSpring,
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                  }}>
                    <div style={{
                      background: colors.white,
                      border: `3px solid ${blueShades[i]}`,
                      borderRadius: 20,
                      padding: "16px 28px",
                      boxShadow: `0 4px 16px ${blueShades[i]}40`,
                    }}>
                      <span style={{
                        fontFamily: montserrat,
                        fontWeight: 700,
                        fontSize: 36,
                        color: blueShades[i === 0 ? 4 : i < 3 ? 5 : 4],
                      }}>
                        {token}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase 3: Token ID Mapping - arrows and badges */}
            {currentPhase === 3 && (
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 10 }}>
                {tokens.map((_, i) => {
                  const arrowDelay = phase2End + 4 + i * 6;
                  const arrowSpring = spring({ frame, fps, config: { damping: 200 }, delay: arrowDelay });
                  const badgeDelay = arrowDelay + 8;
                  const badgeSpring = spring({ frame, fps, config: { damping: 10, stiffness: 160 }, delay: badgeDelay });
                  const badgeScale = interpolate(badgeSpring, [0, 1], [0.3, 1]);

                  const slotMachineEnd = badgeDelay + 6;
                  const slotVal = frame < badgeDelay ? 0 : frame < slotMachineEnd
                    ? Math.round(interpolate(frame, [badgeDelay, slotMachineEnd], [0, tokenIds[i] * 3], { extrapolateRight: "clamp" }) % (tokenIds[i] * 2))
                    : tokenIds[i];

                  return (
                    <div key={i} style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 90,
                    }}>
                      {/* Arrow */}
                      <div style={{
                        opacity: arrowSpring,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <ArrowDown size={28} color={colors.success} />
                      </div>
                      {/* ID Badge */}
                      <div style={{
                        opacity: badgeSpring,
                        transform: `scale(${badgeScale})`,
                      }}>
                        <div style={{
                          background: colors.accent,
                          borderRadius: 14,
                          padding: "10px 22px",
                          border: `3px solid ${colors.accentLight}`,
                          boxShadow: `0 4px 12px ${colors.accent}40`,
                        }}>
                          <span style={{
                            fontFamily: montserrat,
                            fontWeight: 900,
                            fontSize: 28,
                            color: colors.white,
                          }}>
                            {slotVal}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 4: Vocab to Embedding */}
      {currentPhase === 4 && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          zIndex: 30,
          opacity: phase4Fade,
          padding: "0 80px",
        }}>
          {/* Vocab Table */}
          {(() => {
            const vocabSlide = spring({ frame: frame - phase3End, fps, config: { damping: 12, stiffness: 120 }, delay: 4 });
            const shrinkDelay = Math.round(1.5 * fps);
            const shrinkSpring = spring({ frame: frame - phase3End, fps, config: { damping: 15, stiffness: 80 }, delay: shrinkDelay });
            const vocabScaleY = interpolate(shrinkSpring, [0, 1], [1, 0.08]);
            const vocabX = interpolate(vocabSlide, [0, 1], [-400, 0]);

            const counterStart = phase3End + Math.round(1.0 * fps);
            const counterEnd = phase3End + Math.round(2.8 * fps);
            const counterVal = Math.round(interpolate(frame, [counterStart, counterEnd], [50000, 768], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            const counterHue = interpolate(frame, [counterStart, counterEnd], [330, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                opacity: vocabSlide,
                transform: `translateX(${vocabX}px)`,
              }}>
                <div style={{
                  fontFamily: montserrat,
                  fontWeight: 900,
                  fontSize: 56,
                  color: `hsl(${counterHue}, 70%, 45%)`,
                  lineHeight: 1,
                }}>
                  {counterVal.toLocaleString()}
                </div>
                <div style={{
                  fontFamily: inter,
                  fontWeight: 600,
                  fontSize: 16,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}>
                  {counterVal > 1000 ? "vocab entries" : "dimensions"}
                </div>
                <div style={{
                  width: 240,
                  height: 320,
                  borderRadius: 16,
                  background: colors.white,
                  borderLeft: `6px solid ${colors.primary}`,
                  border: `3px solid ${colors.border}`,
                  overflow: "hidden",
                  transform: `scaleY(${vocabScaleY})`,
                  transformOrigin: "center center",
                  boxShadow: `0 4px 20px ${colors.primary}15`,
                  display: "flex",
                  flexDirection: "column",
                  padding: 8,
                  gap: 2,
                }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} style={{
                      height: 14,
                      borderRadius: 4,
                      background: i % 3 === 0 ? `${colors.primary}15` : `${colors.muted}`,
                      width: `${60 + (i * 7) % 40}%`,
                    }} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Arrow */}
          {(() => {
            const arrowDelay = Math.round(2.2 * fps);
            const arrowSpring = spring({ frame: frame - phase3End, fps, config: { damping: 200 }, delay: arrowDelay });
            return (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: arrowSpring,
                transform: `scale(${interpolate(arrowSpring, [0, 1], [0.5, 1])})`,
              }}>
                <Zap size={36} color={colors.accent} />
                <div style={{
                  fontFamily: inter,
                  fontWeight: 700,
                  fontSize: 13,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  textAlign: "center",
                  maxWidth: 100,
                }}>
                  LOOKUP + COMPRESS
                </div>
              </div>
            );
          })()}

          {/* Embedding Vector */}
          {(() => {
            const embedDelay = Math.round(2.6 * fps);
            const embedSlide = spring({ frame: frame - phase3End, fps, config: { damping: 12, stiffness: 120 }, delay: embedDelay });
            const embedX = interpolate(embedSlide, [0, 1], [300, 0]);
            const embedVals = [0.23, -1.4, 0.87, -0.02, 1.56, -0.71, 0.44, -1.23, 0.09, 0.67, -0.38, 1.01];

            return (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: embedSlide,
                transform: `translateX(${embedX}px)`,
              }}>
                <div style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  maxWidth: 500,
                }}>
                  {embedVals.map((v, i) => {
                    const dimSpring = spring({ frame: frame - phase3End, fps, config: { damping: 10, stiffness: 150 }, delay: embedDelay + i * 3 });
                    const dimScale = interpolate(dimSpring, [0, 1], [0.3, 1]);
                    return (
                      <div key={i} style={{
                        width: 72,
                        height: 52,
                        borderRadius: 12,
                        background: `${colors.success}20`,
                        border: `3px solid ${colors.success}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: dimSpring,
                        transform: `scale(${dimScale})`,
                        boxShadow: `0 3px 10px ${colors.success}25`,
                      }}>
                        <span style={{
                          fontFamily: montserrat,
                          fontWeight: 700,
                          fontSize: 16,
                          color: colors.success,
                        }}>
                          {v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const lblSpring = spring({ frame: frame - phase3End, fps, config: { damping: 200 }, delay: embedDelay + 40 });
                  return (
                    <div style={{
                      fontFamily: montserrat,
                      fontWeight: 700,
                      fontSize: 18,
                      color: colors.success,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      opacity: lblSpring,
                      transform: `translateY(${interpolate(lblSpring, [0, 1], [15, 0])}px)`,
                    }}>
                      768-DIM EMBEDDING VECTOR
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

      {/* Phase 5: BPE Comparison */}
      {phase5Visible && (() => {
        const frameInPhase = frame - phase4End;

        const leftSlide = spring({ frame: frameInPhase, fps, config: { damping: 10, stiffness: 120 }, delay: 4 });
        const leftX = interpolate(leftSlide, [0, 1], [-600, 0]);

        const rightSlide = spring({ frame: frameInPhase, fps, config: { damping: 10, stiffness: 120 }, delay: 8 });
        const rightX = interpolate(rightSlide, [0, 1], [600, 0]);

        const bpeTokens = [
          { text: "un", bytes: 2, color: blueShades[0] },
          { text: "happi", bytes: 5, color: blueShades[2] },
          { text: "ness", bytes: 4, color: blueShades[4] },
        ];

        const splitDelay = 20;
        const splitSpring = spring({ frame: frameInPhase, fps, config: { damping: 12, stiffness: 160 }, delay: splitDelay });

        const winnerDelay = 50;
        const winnerSpring = spring({ frame: frameInPhase, fps, config: { damping: 8, stiffness: 200 }, delay: winnerDelay });
        const winnerScale = interpolate(winnerSpring, [0, 1], [0.2, 1]);
        const winnerRotate = interpolate(winnerSpring, [0, 1], [-15, -3]);

        return (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
            zIndex: 40,
            padding: "0 100px",
          }}>
            {/* Word-level panel */}
            <div style={{
              opacity: leftSlide,
              transform: `translateX(${leftX}px)`,
              flex: 1,
              maxWidth: 560,
            }}>
              <div style={{
                background: colors.white,
                border: `4px solid ${colors.primaryLight}`,
                borderRadius: 28,
                padding: "36px 40px",
                boxShadow: `0 8px 30px ${colors.primary}15`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}>
                <div style={{
                  fontFamily: montserrat,
                  fontWeight: 900,
                  fontSize: 24,
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                }}>
                  WORD-LEVEL
                </div>
                <div style={{
                  background: colors.white,
                  border: `3px solid ${blueShades[4]}`,
                  borderRadius: 20,
                  padding: "18px 36px",
                  boxShadow: `0 4px 16px ${blueShades[4]}30`,
                }}>
                  <span style={{
                    fontFamily: montserrat,
                    fontWeight: 700,
                    fontSize: 34,
                    color: blueShades[5],
                  }}>
                    unhappiness
                  </span>
                </div>
                <div style={{
                  background: `${colors.destructive}15`,
                  border: `2px solid ${colors.destructive}`,
                  borderRadius: 12,
                  padding: "6px 18px",
                }}>
                  <span style={{
                    fontFamily: inter,
                    fontWeight: 700,
                    fontSize: 16,
                    color: colors.destructive,
                  }}>
                    12 bytes — 1 token
                  </span>
                </div>
              </div>
            </div>

            {/* BPE panel */}
            <div style={{
              opacity: rightSlide,
              transform: `translateX(${rightX}px)`,
              flex: 1,
              maxWidth: 560,
              position: "relative",
            }}>
              <div style={{
                background: colors.white,
                border: `4px solid ${colors.success}`,
                borderRadius: 28,
                padding: "36px 40px",
                boxShadow: `0 8px 30px ${colors.success}15`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}>
                <div style={{
                  fontFamily: montserrat,
                  fontWeight: 900,
                  fontSize: 24,
                  color: colors.success,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                }}>
                  BPE
                </div>

                {/* BPE tokens */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {bpeTokens.map((t, i) => {
                    const tokenDelay = splitDelay + i * 6;
                    const tSpring = spring({ frame: frameInPhase, fps, config: { damping: 10, stiffness: 160 }, delay: tokenDelay });
                    const tScale = interpolate(tSpring, [0, 1], [0.3, 1]);
                    const tRot = interpolate(tSpring, [0, 1], [i % 2 === 0 ? -10 : 10, 0]);

                    const badgeDelay = tokenDelay + 10;
                    const bSpring = spring({ frame: frameInPhase, fps, config: { damping: 10, stiffness: 150 }, delay: badgeDelay });
                    const bScale = interpolate(bSpring, [0, 1], [0.3, 1]);

                    return (
                      <div key={i} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                      }}>
                        <div style={{
                          opacity: tSpring,
                          transform: `scale(${tScale}) rotate(${tRot}deg)`,
                        }}>
                          <div style={{
                            background: colors.white,
                            border: `3px solid ${t.color}`,
                            borderRadius: 18,
                            padding: "14px 24px",
                            boxShadow: `0 4px 14px ${t.color}40`,
                          }}>
                            <span style={{
                              fontFamily: montserrat,
                              fontWeight: 700,
                              fontSize: 30,
                              color: blueShades[i === 0 ? 4 : i === 1 ? 5 : 4],
                            }}>
                              {t.text}
                            </span>
                          </div>
                        </div>
                        <div style={{
                          opacity: bSpring,
                          transform: `scale(${bScale})`,
                        }}>
                          <div style={{
                            background: `${colors.destructive}15`,
                            border: `2px solid ${colors.destructive}`,
                            borderRadius: 10,
                            padding: "4px 14px",
                          }}>
                            <span style={{
                              fontFamily: inter,
                              fontWeight: 700,
                              fontSize: 14,
                              color: colors.destructive,
                            }}>
                              {t.bytes} bytes
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Split indicators */}
                {splitSpring > 0 && (
                  <div style={{
                    fontFamily: inter,
                    fontWeight: 600,
                    fontSize: 15,
                    color: colors.mutedForeground,
                    opacity: interpolate(splitSpring, [0, 1], [0, 0.8]),
                  }}>
                    3 sub-word tokens — 11 bytes total
                  </div>
                )}
              </div>

              {/* Winner Banner */}
              {winnerSpring > 0 && (
                <div style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  opacity: winnerSpring,
                  transform: `scale(${winnerScale}) rotate(${winnerRotate}deg)`,
                  zIndex: 50,
                }}>
                  <div style={{
                    background: colors.primary,
                    border: `4px solid ${colors.primaryDark}`,
                    borderRadius: 20,
                    padding: "12px 28px",
                    boxShadow: `0 6px 24px ${colors.primary}50`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <Trophy size={26} color={colors.white} />
                    <span style={{
                      fontFamily: montserrat,
                      fontWeight: 900,
                      fontSize: 20,
                      color: colors.white,
                      letterSpacing: 1,
                    }}>
                      MORE EFFICIENT!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};