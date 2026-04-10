import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Cpu } from "lucide-react";

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

const tokens = ["Hello", ",", " ", "World", "!"];
const tokenIds = [15496, 11, 220, 10603, 0];
const tokenWidths = [130, 72, 72, 130, 72];

const embeddingValues: number[][] = [
  [0.8, 0.3, 0.6, 0.9, 0.2, 0.7, 0.4, 0.8, 0.1, 0.5, 0.9, 0.3, 0.7, 0.2, 0.6, 0.8, 0.4, 0.1, 0.5, 0.9, 0.3, 0.7, 0.6, 0.2],
  [0.2, 0.1, 0.3, 0.2, 0.4, 0.1, 0.3, 0.2, 0.1, 0.4, 0.2, 0.3, 0.1, 0.2, 0.4, 0.3, 0.1, 0.2, 0.3, 0.1, 0.4, 0.2, 0.3, 0.1],
  [0.05, 0.02, 0.08, 0.03, 0.06, 0.01, 0.04, 0.07, 0.02, 0.05, 0.03, 0.08, 0.01, 0.06, 0.04, 0.02, 0.07, 0.03, 0.05, 0.01, 0.08, 0.04, 0.02, 0.06],
  [0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9, 0.2, 0.7, 0.5, 0.8, 0.3, 0.6, 0.4, 0.9, 0.7, 0.2, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4],
  [0.3, 0.7, 0.1, 0.5, 0.9, 0.2, 0.6, 0.3, 0.8, 0.1, 0.4, 0.7, 0.2, 0.9, 0.5, 0.3, 0.6, 0.8, 0.1, 0.4, 0.7, 0.2, 0.9, 0.5],
];

export const LlmTokenizationExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Title (0 - 1.5s)
  const titleFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) });
  const titleY = interpolate(titleFade, [0, 1], [20, 0]);
  const underlineProgress = interpolate(frame, [Math.round(0.6 * fps), Math.round(1.2 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 2: Raw text card (1.5s - 3.5s)
  const rawCardFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.5 * fps) });
  const rawCardY = interpolate(rawCardFade, [0, 1], [20, 0]);
  const rawText = "\"Hello, World!\"";
  const typewriterProgress = interpolate(frame, [Math.round(2.0 * fps), Math.round(3.2 * fps)], [0, rawText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visibleChars = Math.floor(typewriterProgress);

  // Phase 4: Tokenization split (4.5s - 7s)
  const rawCardExit = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.5 * fps) });
  const rawCardExitY = interpolate(rawCardExit, [0, 1], [0, -30]);
  const rawCardExitOpacity = interpolate(rawCardExit, [0, 1], [1, 0]);

  const tokensLabelFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.8 * fps) });

  const tokenSprings = tokens.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(5.0 * fps) + i * 4 })
  );

  // Phase 6: Token ID assignment (8s - 10.5s)
  const idLabelFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(8.0 * fps) });

  const idSprings = tokenIds.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(8.2 * fps) + i * 5 })
  );

  const idCounters = tokenIds.map((targetId, i) => {
    const startFrame = Math.round(8.2 * fps) + i * 5;
    const endFrame = startFrame + Math.round(0.5 * fps);
    return Math.round(interpolate(frame, [startFrame, endFrame], [0, targetId], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  });

  const connectorSprings = tokenIds.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(8.1 * fps) + i * 5 })
  );

  // Phase 8: Embedding reveal (11.5s - 14s)
  const compactSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(11.5 * fps) });
  const compactScale = interpolate(compactSpring, [0, 1], [1, 0.75]);
  const compactY = interpolate(compactSpring, [0, 1], [0, -60]);

  const embLabelFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(11.8 * fps) });

  const embGridSprings = tokens.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(12.0 * fps) + i * 3 })
  );

  const arrowProgress = interpolate(frame, [Math.round(13.0 * fps), Math.round(13.6 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arrowLabelFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(13.4 * fps) });

  // Phase 9: Summary (14s - 15s)
  const summaryFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(14.0 * fps) });
  const summaryY = interpolate(summaryFade, [0, 1], [20, 0]);

  // Determine if we are past the raw card phase
  const showRawCard = frame < Math.round(5.5 * fps);
  const showTokens = frame >= Math.round(4.8 * fps);
  const showIds = frame >= Math.round(8.0 * fps);
  const showEmbeddings = frame >= Math.round(11.5 * fps);

  // Token row layout
  const tokenGap = 16;

  const getEmbeddingColor = (value: number, tokenIndex: number): string => {
    if (tokenIndex === 4) {
      if (value > 0.6) return colors.warning;
      return interpolateColor(value, colors.primaryLight, colors.accent);
    }
    if (tokenIndex === 2) {
      const lightness = interpolate(value, [0, 1], [92, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return `hsl(217, 60%, ${lightness}%)`;
    }
    return interpolateColor(value, colors.primaryLight, colors.accent);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.5 }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 60, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10,
        opacity: titleFade, transform: `translateY(${titleY}px)`,
      }}>
        <div style={{
          fontFamily: montserrat, fontSize: 52, fontWeight: 700, color: colors.foreground, letterSpacing: -1,
        }}>
          How LLM Tokenization Works
        </div>
        <div style={{
          width: 520, height: 2, backgroundColor: colors.primary, marginTop: 12,
          transform: `scaleX(${underlineProgress})`, transformOrigin: "left",
        }} />
      </div>

      {/* Main content area */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        zIndex: 5,
      }}>

        {/* Raw Input Card */}
        {showRawCard && (
          <div style={{
            opacity: rawCardFade * rawCardExitOpacity,
            transform: `translateY(${rawCardY + rawCardExitY}px)`,
          }}>
            <div style={{
              ...glass, width: 700, height: 140, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "16px 32px",
              borderRadius: 16, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 16, left: 28,
                fontFamily: inter, fontSize: 11, fontWeight: 600, color: colors.mutedForeground,
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>
                RAW INPUT
              </div>
              <div style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: 48, fontWeight: 700, color: colors.foreground, marginTop: 8,
                overflow: "hidden", whiteSpace: "nowrap",
              }}>
                {rawText.substring(0, visibleChars)}
                {visibleChars < rawText.length && (
                  <span style={{
                    display: "inline-block", width: 3, height: 48, backgroundColor: colors.primary,
                    marginLeft: 2, verticalAlign: "middle",
                    opacity: Math.sin(frame * 0.2) > 0 ? 1 : 0,
                  }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Token blocks + IDs + Embeddings container */}
        {showTokens && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            transform: showEmbeddings ? `scale(${compactScale}) translateY(${compactY}px)` : undefined,
          }}>
            {/* Tokens label */}
            <div style={{
              fontFamily: inter, fontSize: 11, fontWeight: 600, color: colors.mutedForeground,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
              opacity: tokensLabelFade,
              transform: `translateY(${interpolate(tokensLabelFade, [0, 1], [20, 0])}px)`,
            }}>
              TOKENS
            </div>

            {/* Token blocks row */}
            <div style={{ display: "flex", gap: tokenGap, alignItems: "center" }}>
              {tokens.map((token, i) => {
                const s = tokenSprings[i];
                const y = interpolate(s, [0, 1], [20, 0]);
                return (
                  <div key={i} style={{
                    width: tokenWidths[i], height: 72,
                    background: colors.white,
                    border: `2px solid ${colors.primary}`,
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)",
                    opacity: s,
                    transform: `translateY(${y}px)`,
                  }}>
                    <span style={{
                      fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                      fontSize: 24, fontWeight: 600,
                      color: token === " " ? colors.mutedForeground : colors.foreground,
                    }}>
                      {token === " " ? "⎵" : token}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connector lines + Token IDs */}
            {showIds && (
              <>
                {/* Connector lines */}
                <div style={{ display: "flex", gap: tokenGap, alignItems: "center", height: 28 }}>
                  {tokenIds.map((_, i) => {
                    const cSpring = connectorSprings[i];
                    const lineHeight = interpolate(cSpring, [0, 1], [0, 28]);
                    return (
                      <div key={i} style={{
                        width: tokenWidths[i], display: "flex", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 1, height: lineHeight, backgroundColor: colors.accent,
                          opacity: cSpring,
                        }} />
                      </div>
                    );
                  })}
                </div>

                {/* Token IDs label */}
                <div style={{
                  fontFamily: inter, fontSize: 11, fontWeight: 600, color: colors.mutedForeground,
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, marginTop: 4,
                  opacity: idLabelFade,
                  transform: `translateY(${interpolate(idLabelFade, [0, 1], [20, 0])}px)`,
                }}>
                  TOKEN IDs
                </div>

                {/* ID badges row */}
                <div style={{ display: "flex", gap: tokenGap, alignItems: "center" }}>
                  {tokenIds.map((_, i) => {
                    const s = idSprings[i];
                    const y = interpolate(s, [0, 1], [20, 0]);
                    return (
                      <div key={i} style={{
                        width: tokenWidths[i], height: 36,
                        backgroundColor: colors.accent,
                        borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: s,
                        transform: `translateY(${y}px)`,
                      }}>
                        <span style={{
                          fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                          fontSize: 16, fontWeight: 600, color: colors.white,
                        }}>
                          {idCounters[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Embeddings section */}
        {showEmbeddings && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            marginTop: 24,
          }}>
            {/* Embedding label */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              opacity: embLabelFade,
              transform: `translateY(${interpolate(embLabelFade, [0, 1], [20, 0])}px)`,
            }}>
              <Cpu size={20} color={colors.primary} />
              <span style={{
                fontFamily: inter, fontSize: 18, fontWeight: 600, color: colors.primary,
              }}>
                Embedding Vectors
              </span>
            </div>

            {/* Embedding grids row */}
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {tokens.map((_, ti) => {
                const s = embGridSprings[ti];
                const y = interpolate(s, [0, 1], [20, 0]);
                return (
                  <div key={ti} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    opacity: s, transform: `translateY(${y}px)`,
                  }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(6, 10px)", gap: 2,
                    }}>
                      {embeddingValues[ti].map((val, vi) => (
                        <div key={vi} style={{
                          width: 10, height: 10, borderRadius: 2,
                          backgroundColor: getEmbeddingColor(val, ti),
                          opacity: interpolate(val, [0, 1], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                      fontSize: 10, color: colors.mutedForeground, fontWeight: 500,
                    }}>
                      {tokens[ti] === " " ? "⎵" : tokens[ti]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Arrow into the model */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 300, height: 20 }}>
                <div style={{
                  position: "absolute", top: 9, left: 0,
                  width: interpolate(arrowProgress, [0, 1], [0, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  height: 2, backgroundColor: colors.foreground,
                }} />
                {arrowProgress > 0.9 && (
                  <div style={{
                    position: "absolute", top: 4, left: 274,
                    width: 0, height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: `10px solid ${colors.foreground}`,
                    opacity: interpolate(arrowProgress, [0.9, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }} />
                )}
              </div>
              <span style={{
                fontFamily: inter, fontSize: 15, fontWeight: 500, color: colors.mutedForeground,
                opacity: arrowLabelFade,
                transform: `translateY(${interpolate(arrowLabelFade, [0, 1], [10, 0])}px)`,
              }}>
                Into the Transformer
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary caption */}
      <div style={{
        position: "absolute", bottom: 32, left: 0, right: 0,
        display: "flex", justifyContent: "center", zIndex: 10,
        opacity: summaryFade,
        transform: `translateY(${summaryY}px)`,
      }}>
        <span style={{
          fontFamily: inter, fontSize: 14, fontWeight: 400, color: colors.mutedForeground,
          maxWidth: 900, textAlign: "center", lineHeight: 1.6,
        }}>
          Each token maps to a unique ID → looked up in an embedding table → fed into the transformer.
        </span>
      </div>
    </AbsoluteFill>
  );
};

function interpolateColor(t: number, colorA: string, colorB: string): string {
  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  };
  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(r1 + (r2 - r1) * t);
  const g = clamp(g1 + (g2 - g1) * t);
  const b = clamp(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}