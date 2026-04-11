import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Database, Zap, X } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#ffffff", foreground: "#0f172a", primary: "#2563eb",
  primaryLight: "#3b82f6", primaryDark: "#1d4ed8", accent: "#7c3aed",
  accentLight: "#8b5cf6", muted: "#f1f5f9", mutedForeground: "#64748b",
  border: "#e2e8f0", success: "#16a34a", destructive: "#dc2626",
  warning: "#d97706", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 12, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
};

const gridBg: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

const tokens = ["When", "you", "feed", "a", "prompt", "..."];
const keyWidths = [40, 160, 80, 140, 60, 180];
const valueWidths = [120, 60, 150, 90, 170, 50];

export const KVCacheExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);

  const tokenSprings = tokens.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.5 * fps) + i * 6 })
  );

  const dividerWidth = interpolate(frame, [Math.round(1.8 * fps), Math.round(2.5 * fps)], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const attentionSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.5 * fps) });
  const attentionY = interpolate(attentionSpring, [0, 1], [20, 0]);

  const scanStart = Math.round(3.0 * fps);
  const scanEnd = Math.round(4.0 * fps);
  const scanProgress = interpolate(frame, [scanStart, scanEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const attentionBorderColor = frame >= scanEnd ? colors.primary : interpolate(
    scanProgress, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  ) > 0.8 ? colors.primary : colors.border;

  const processingTokenIdx = interpolate(frame, [scanStart, scanEnd], [1, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const keyBarSprings = keyWidths.map((_, i) => {
    const barStart = Math.round(5.0 * fps) + i * 3;
    return interpolate(frame, [barStart, barStart + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  });

  const kLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(5.0 * fps) });
  const keyDescSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(6.2 * fps) });

  const valueBarSprings = valueWidths.map((_, i) => {
    const barStart = Math.round(6.5 * fps) + i * 3;
    return interpolate(frame, [barStart, barStart + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  });

  const vLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(6.5 * fps) });
  const valueDescSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(7.8 * fps) });

  const cacheBoxSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(8.5 * fps) });
  const cacheBoxY = interpolate(cacheBoxSpring, [0, 1], [40, 0]);

  const vectorsShrinkStart = Math.round(9.0 * fps);
  const vectorsShrinkEnd = Math.round(10.0 * fps);
  const vectorsShrink = interpolate(frame, [vectorsShrinkStart, vectorsShrinkEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showVectors = frame < vectorsShrinkEnd + 5;

  const cacheRowSprings = tokens.map((_, i) => {
    const delay = i === 0 ? Math.round(9.5 * fps) : Math.round(10.5 * fps) + (i - 1) * 12;
    return spring({ frame, fps, config: { damping: 200 }, delay });
  });

  const fillPercent = interpolate(
    frame,
    [Math.round(9.5 * fps), Math.round(13.0 * fps)],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cacheFlashFrames = [
    Math.round(9.5 * fps),
    Math.round(10.5 * fps),
    Math.round(10.5 * fps) + 12,
    Math.round(10.5 * fps) + 24,
    Math.round(10.5 * fps) + 36,
    Math.round(10.5 * fps) + 48,
  ];

  let cacheFlashOpacity = 0;
  for (const flashFrame of cacheFlashFrames) {
    const localProgress = frame - flashFrame;
    if (localProgress >= 0 && localProgress <= 12) {
      const flashVal = interpolate(localProgress, [0, 4, 12], [0, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      cacheFlashOpacity = Math.max(cacheFlashOpacity, flashVal);
    }
  }

  const ghostTextSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(13.0 * fps) });
  const ghostTextY = interpolate(ghostTextSpring, [0, 1], [20, 0]);

  const strikeStart = Math.round(13.5 * fps);
  const strikeEnd = Math.round(14.0 * fps);
  const strikeProgress = interpolate(frame, [strikeStart, strikeEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const footerSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(13.8 * fps) });
  const footerY = interpolate(footerSpring, [0, 1], [20, 0]);

  const finalCacheBorderPulse = frame >= Math.round(13.5 * fps) ? interpolate(
    Math.sin((frame - Math.round(13.5 * fps)) * 0.15), [-1, 1], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  ) : 0;

  const showAttention = frame >= Math.round(2.5 * fps);
  const showKV = frame >= Math.round(5.0 * fps);
  const showCache = frame >= Math.round(8.5 * fps);
  const showGhostText = frame >= Math.round(13.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.5 }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 120px", zIndex: 1 }}>

        {/* Scene Title */}
        <div style={{
          alignSelf: "flex-start",
          opacity: titleSpring,
          transform: `translateY(${titleY}px)`,
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 600,
          color: colors.mutedForeground,
          textTransform: "uppercase" as const,
          letterSpacing: 3,
          marginBottom: 30,
        }}>
          How the KV Cache Works
        </div>

        {/* Token Row */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          {tokens.map((token, i) => {
            const s = tokenSprings[i];
            const tX = interpolate(s, [0, 1], [-20, 0]);
            return (
              <div key={i} style={{
                opacity: s,
                transform: `translateX(${tX}px)`,
                padding: "8px 18px",
                borderRadius: 8,
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 15,
                fontWeight: 500,
                color: colors.foreground,
              }}>
                {token}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{
          width: `${dividerWidth}%`,
          maxWidth: 600,
          height: 1,
          backgroundColor: colors.border,
          marginBottom: 16,
          marginTop: 8,
        }} />

        {/* Middle section: Attention Block + K/V Vectors side by side */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          flex: 1,
          justifyContent: "flex-start",
        }}>

          {/* Attention Mechanism Block */}
          {showAttention && (
            <div style={{
              opacity: attentionSpring,
              transform: `translateY(${attentionY}px)`,
              position: "relative",
              width: 340,
              height: 64,
              borderRadius: 12,
              backgroundColor: "#dbeafe",
              border: `2px solid ${attentionBorderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* Scan laser */}
              {scanProgress > 0 && scanProgress < 1 && (
                <div style={{
                  position: "absolute",
                  top: interpolate(scanProgress, [0, 1], [0, 60]),
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: colors.primary,
                  opacity: 0.7,
                }} />
              )}
              <Zap size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <span style={{
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 700,
                color: colors.primary,
              }}>
                Attention Mechanism
              </span>
              {scanProgress > 0 && scanProgress < 1 && (
                <span style={{
                  position: "absolute",
                  bottom: 4,
                  right: 12,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
                  color: colors.mutedForeground,
                }}>
                  token [{Math.min(6, Math.floor(processingTokenIdx))}/6]
                </span>
              )}
            </div>
          )}

          {/* K and V Vectors side by side */}
          {showKV && showVectors && (
            <div style={{
              display: "flex",
              gap: 60,
              alignItems: "flex-start",
              opacity: vectorsShrink,
              transform: `scale(${interpolate(vectorsShrink, [0, 1], [0.7, 1])})`,
            }}>
              {/* Key Vector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{
                  opacity: kLabelSpring,
                  transform: `translateY(${interpolate(kLabelSpring, [0, 1], [10, 0])}px)`,
                  padding: "4px 16px",
                  borderRadius: 20,
                  backgroundColor: "#ede9fe",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.accent }}>K</span>
                  <span style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: colors.accent }}>Key Vector</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {keyWidths.map((w, i) => (
                    <div key={i} style={{
                      width: interpolate(keyBarSprings[i], [0, 1], [0, w]),
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.accentLight,
                      opacity: 0.7 + keyBarSprings[i] * 0.3,
                    }} />
                  ))}
                </div>
                <div style={{
                  opacity: keyDescSpring,
                  transform: `translateY(${interpolate(keyDescSpring, [0, 1], [10, 0])}px)`,
                  fontFamily: inter,
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.mutedForeground,
                  textAlign: "center" as const,
                }}>
                  Acts like a label / index
                </div>
              </div>

              {/* Dashed separator */}
              <div style={{
                width: 1,
                height: 100,
                borderLeft: `1px dashed ${colors.border}`,
                alignSelf: "center",
              }} />

              {/* Value Vector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{
                  opacity: vLabelSpring,
                  transform: `translateY(${interpolate(vLabelSpring, [0, 1], [10, 0])}px)`,
                  padding: "4px 16px",
                  borderRadius: 20,
                  backgroundColor: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.primary }}>V</span>
                  <span style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: colors.primary }}>Value Vector</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {valueWidths.map((w, i) => (
                    <div key={i} style={{
                      width: interpolate(valueBarSprings[i], [0, 1], [0, w]),
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.primaryLight,
                      opacity: 0.7 + valueBarSprings[i] * 0.3,
                    }} />
                  ))}
                </div>
                <div style={{
                  opacity: valueDescSpring,
                  transform: `translateY(${interpolate(valueDescSpring, [0, 1], [10, 0])}px)`,
                  fontFamily: inter,
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.mutedForeground,
                  textAlign: "center" as const,
                }}>
                  Holds semantic meaning
                </div>
              </div>
            </div>
          )}

          {/* KV Cache Box */}
          {showCache && (
            <div style={{
              opacity: cacheBoxSpring,
              transform: `translateY(${cacheBoxY}px)`,
              position: "relative",
              width: 700,
              ...glass,
              borderRadius: 16,
              border: `2px solid ${finalCacheBorderPulse > 0 ? `rgba(22, 163, 74, ${interpolate(finalCacheBorderPulse, [0, 1], [0.3, 0.8])})` : colors.border}`,
              padding: "16px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "hidden",
            }}>
              {/* Flash overlay */}
              {cacheFlashOpacity > 0 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: colors.success,
                  opacity: cacheFlashOpacity,
                  borderRadius: 16,
                  pointerEvents: "none" as const,
                }} />
              )}

              {/* Cache header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Database size={16} color={colors.success} />
                <span style={{
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.success,
                  textTransform: "uppercase" as const,
                  letterSpacing: 2,
                }}>
                  KV Cache — Short-Term Memory
                </span>
              </div>

              {/* Cache rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {tokens.map((token, i) => {
                  const rowS = cacheRowSprings[i];
                  const rowY = interpolate(rowS, [0, 1], [15, 0]);
                  return (
                    <div key={i} style={{
                      opacity: rowS,
                      transform: `translateY(${rowY}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "5px 10px",
                      borderRadius: 8,
                      backgroundColor: i % 2 === 0 ? "rgba(241,245,249,0.6)" : "transparent",
                    }}>
                      <div style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.border}`,
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 12,
                        fontWeight: 500,
                        color: colors.foreground,
                        minWidth: 60,
                        textAlign: "center" as const,
                      }}>
                        {token}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: montserrat, fontSize: 11, fontWeight: 700, color: colors.accent }}>K</span>
                        <div style={{
                          width: interpolate(rowS, [0, 1], [0, keyWidths[i] * 0.4]),
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.accentLight,
                          opacity: 0.6,
                        }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: montserrat, fontSize: 11, fontWeight: 700, color: colors.primary }}>V</span>
                        <div style={{
                          width: interpolate(rowS, [0, 1], [0, valueWidths[i] * 0.4]),
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.primaryLight,
                          opacity: 0.6,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fill meter */}
              <div style={{
                width: "100%",
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.muted,
                overflow: "hidden",
                marginTop: 4,
              }}>
                <div style={{
                  width: `${fillPercent}%`,
                  height: "100%",
                  borderRadius: 2,
                  backgroundColor: colors.success,
                }} />
              </div>
              <div style={{
                fontFamily: inter,
                fontSize: 11,
                fontWeight: 500,
                color: colors.mutedForeground,
                textAlign: "right" as const,
              }}>
                {Math.round(fillPercent)}% filled
              </div>
            </div>
          )}

          {/* Ghost text with strikethrough */}
          {showGhostText && (
            <div style={{
              opacity: ghostTextSpring,
              transform: `translateY(${ghostTextY}px)`,
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}>
              <div style={{ position: "relative" }}>
                <span style={{
                  fontFamily: inter,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: 1,
                }}>
                  RE-CALCULATE ENTIRE CONTEXT
                </span>
                {/* Strike-through line */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: -4,
                  width: interpolate(strikeProgress, [0, 1], [0, 105]),
                  maxWidth: "105%",
                  height: 3,
                  backgroundColor: colors.destructive,
                  borderRadius: 2,
                  transform: "translateY(-50%) rotate(-2deg)",
                }} />
              </div>
              {strikeProgress > 0.8 && (
                <X size={20} color={colors.destructive} style={{
                  opacity: interpolate(strikeProgress, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }} />
              )}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div style={{
          opacity: footerSpring,
          transform: `translateY(${footerY}px)`,
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 500,
          color: colors.mutedForeground,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.6,
          paddingBottom: 20,
        }}>
          The KV Cache stores Keys & Values so every new token avoids recomputing the full context.
        </div>
      </div>
    </AbsoluteFill>
  );
};