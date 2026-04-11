import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { FileCode, FileText, FileCheck, AlertTriangle, ArrowDown } from "lucide-react";

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

export const KVCacheScalingProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1End = Math.round(7 * fps);
  const phase2End = Math.round(13 * fps);
  const phase3End = Math.round(19 * fps);
  const phase4End = Math.round(24 * fps);

  const currentPhase = frame < phase1End ? 1 : frame < phase2End ? 2 : frame < phase3End ? 3 : frame < phase4End ? 4 : 5;

  // ===== PHASE 1: Three Growth Axes =====
  const phase1Opacity = interpolate(frame, [0, 10, phase1End - 15, phase1End], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);

  const axes = [
    { label: "Context Length", color: colors.primary, maxWidth: 500, delay: Math.round(0.8 * fps) },
    { label: "Model Layers", color: colors.accent, maxWidth: 420, delay: Math.round(2.0 * fps) },
    { label: "Attention Heads", color: colors.warning, maxWidth: 460, delay: Math.round(3.2 * fps) },
  ];

  const fpStampSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(5.0 * fps) });
  const fpStampY = interpolate(fpStampSpring, [0, 1], [20, 0]);

  const multiplyPulse = frame >= Math.round(5.5 * fps) && frame < phase1End
    ? interpolate(Math.sin((frame - Math.round(5.5 * fps)) * 0.15), [-1, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // ===== PHASE 2: Cache Blows Up =====
  const phase2Opacity = interpolate(frame, [phase1End, phase1End + 10, phase2End - 15, phase2End], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cacheBlockSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase1End + Math.round(0.3 * fps) });

  const documents = [
    { label: "Codebase", icon: "code", delay: phase1End + Math.round(1.5 * fps), sizeIncrease: 80 },
    { label: "PRD", icon: "text", delay: phase1End + Math.round(3.0 * fps), sizeIncrease: 100 },
    { label: "Edge Cases", icon: "check", delay: phase1End + Math.round(4.5 * fps), sizeIncrease: 140 },
  ];

  let cacheWidth = 180;
  let cacheHeight = 120;
  const docSprings = documents.map((doc) => {
    const s = spring({ frame, fps, config: { damping: 200 }, delay: doc.delay });
    return s;
  });

  documents.forEach((doc, i) => {
    const expansion = interpolate(docSprings[i], [0, 1], [0, doc.sizeIncrease]);
    cacheWidth += expansion;
    cacheHeight += expansion * 0.5;
  });

  cacheWidth = Math.min(cacheWidth, 900);
  cacheHeight = Math.min(cacheHeight, 400);

  const cacheHue = interpolate(
    cacheWidth,
    [180, 500, 900],
    [210, 45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== PHASE 3: VRAM Consumed =====
  const phase3Opacity = interpolate(frame, [phase2End, phase2End + 10, phase3End - 15, phase3End], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const vramBarSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase2End + Math.round(0.3 * fps) });

  const weightsProgress = interpolate(
    frame,
    [phase2End + Math.round(1.0 * fps), phase2End + Math.round(2.0 * fps)],
    [0, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const kvCacheProgress = interpolate(
    frame,
    [phase2End + Math.round(2.5 * fps), phase2End + Math.round(4.5 * fps)],
    [0, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const totalFill = weightsProgress + kvCacheProgress * 0.8;
  const overflow = Math.max(0, totalFill - 1);

  const stat1Spring = spring({ frame, fps, config: { damping: 200 }, delay: phase2End + Math.round(3.5 * fps) });
  const stat1Y = interpolate(stat1Spring, [0, 1], [20, 0]);

  const stat2Spring = spring({ frame, fps, config: { damping: 200 }, delay: phase2End + Math.round(5.0 * fps) });
  const stat2Y = interpolate(stat2Spring, [0, 1], [20, 0]);

  const overflowWarningSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase2End + Math.round(4.8 * fps) });

  // ===== PHASE 4: Swap & Crawl =====
  const phase4Opacity = interpolate(frame, [phase3End, phase3End + 10, phase4End - 15, phase4End], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sysRamSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase3End + Math.round(0.5 * fps) });
  const sysRamY = interpolate(sysRamSpring, [0, 1], [30, 0]);

  const spillProgress = interpolate(
    frame,
    [phase3End + Math.round(1.0 * fps), phase3End + Math.round(2.5 * fps)],
    [0, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const throughputStart = phase3End + Math.round(2.0 * fps);
  const throughputEnd = phase3End + Math.round(4.0 * fps);
  const throughputValue = interpolate(
    frame,
    [throughputStart, throughputEnd],
    [100, 8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const throughputSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase3End + Math.round(1.5 * fps) });

  const arrowSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase3End + Math.round(1.0 * fps) });

  // ===== PHASE 5: Output Degrades =====
  const phase5Opacity = interpolate(frame, [phase4End, phase4End + 10, 839, 840], [0, 1, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const outputSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase4End + Math.round(0.3 * fps) });
  const outputY = interpolate(outputSpring, [0, 1], [30, 0]);

  const degradeProgress = interpolate(
    frame,
    [phase4End + Math.round(1.5 * fps), phase4End + Math.round(3.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const finalLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: phase4End + Math.round(3.0 * fps) });
  const finalLabelY = interpolate(finalLabelSpring, [0, 1], [20, 0]);

  const outputWords = [
    { text: "The application uses a ", degrade: false },
    { text: "microservices architecture", degrade: true },
    { text: " with ", degrade: false },
    { text: "event-driven messaging", degrade: true },
    { text: " between the ", degrade: false },
    { text: "auth service", degrade: true },
    { text: " and the ", degrade: false },
    { text: "data pipeline", degrade: true },
    { text: ". The ", degrade: false },
    { text: "Redis cache layer", degrade: true },
    { text: " handles session state while the ", degrade: false },
    { text: "PostgreSQL cluster", degrade: true },
    { text: " manages persistence.", degrade: false },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.5 }} />

      {/* ===== PHASE 1: Three Growth Axes ===== */}
      {currentPhase === 1 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1, opacity: phase1Opacity, gap: 24, padding: "60px 160px",
        }}>
          <div style={{
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
            fontFamily: inter,
            fontSize: 15,
            fontWeight: 600,
            color: colors.mutedForeground,
            textTransform: "uppercase" as const,
            letterSpacing: 3,
            marginBottom: 12,
          }}>
            KV Cache Scales Linearly With...
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%", maxWidth: 700 }}>
            {axes.map((axis, i) => {
              const axisSpring = spring({ frame, fps, config: { damping: 200 }, delay: axis.delay });
              const axisY = interpolate(axisSpring, [0, 1], [20, 0]);
              const barWidth = interpolate(
                frame,
                [axis.delay + Math.round(0.2 * fps), axis.delay + Math.round(1.0 * fps)],
                [0, axis.maxWidth],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div key={i} style={{
                  opacity: axisSpring,
                  transform: `translateY(${axisY}px)`,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{
                    fontFamily: inter, fontSize: 16, fontWeight: 700, color: colors.foreground,
                  }}>
                    {axis.label}
                  </div>
                  <div style={{
                    width: "100%", height: 32, borderRadius: 8,
                    backgroundColor: colors.muted, overflow: "hidden",
                    border: `1px solid ${colors.border}`,
                  }}>
                    <div style={{
                      width: barWidth, height: "100%", borderRadius: 8,
                      backgroundColor: axis.color, opacity: 0.8,
                      display: "flex", alignItems: "center", justifyContent: "flex-end",
                      paddingRight: 12,
                    }}>
                      {barWidth > 100 && (
                        <span style={{
                          fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 700,
                          color: colors.white,
                        }}>
                          {i === 0 ? "32K+" : i === 1 ? "80 layers" : "64 heads"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            opacity: fpStampSpring,
            transform: `translateY(${fpStampY}px) scale(${multiplyPulse})`,
            marginTop: 16,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              fontFamily: montserrat, fontSize: 28, fontWeight: 900, color: colors.foreground,
            }}>
              ×
            </div>
            <div style={{
              ...glass,
              padding: "12px 28px",
              borderRadius: 10,
              border: `2px solid ${colors.destructive}30`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                fontFamily: montserrat, fontSize: 22, fontWeight: 900, color: colors.destructive,
              }}>
                16-bit FP
              </span>
              <span style={{
                fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.mutedForeground,
              }}>
                precision per value
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== PHASE 2: Cache Blows Up ===== */}
      {currentPhase === 2 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1, opacity: phase2Opacity, gap: 28, padding: "40px 100px",
        }}>
          <div style={{
            fontFamily: inter, fontSize: 15, fontWeight: 600, color: colors.mutedForeground,
            textTransform: "uppercase" as const, letterSpacing: 3,
            opacity: cacheBlockSpring,
            transform: `translateY(${interpolate(cacheBlockSpring, [0, 1], [20, 0])}px)`,
          }}>
            Feeding Data Into the KV Cache
          </div>

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Cache block */}
            <div style={{
              width: cacheWidth,
              height: cacheHeight,
              borderRadius: 16,
              backgroundColor: `hsl(${cacheHue}, 80%, 96%)`,
              border: `2px solid hsl(${cacheHue}, 70%, 65%)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8,
              opacity: cacheBlockSpring,
              boxShadow: `0 4px 20px hsl(${cacheHue}, 70%, 80%, 0.3)`,
            }}>
              <span style={{
                fontFamily: montserrat, fontSize: 24, fontWeight: 900,
                color: `hsl(${cacheHue}, 70%, 40%)`,
              }}>
                KV Cache
              </span>
              <span style={{
                fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 600,
                color: `hsl(${cacheHue}, 60%, 50%)`,
              }}>
                {cacheWidth < 300 ? "compact" : cacheWidth < 600 ? "growing..." : "OVERLOADED"}
              </span>
            </div>

            {/* Document icons flying in */}
            {documents.map((doc, i) => {
              const docSpring = docSprings[i];
              const docX = interpolate(docSpring, [0, 1], [300 + i * 50, 0]);
              const docOpacity = interpolate(docSpring, [0, 0.3, 0.8, 1], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const offsetY = (i - 1) * 70;
              return (
                <div key={i} style={{
                  position: "absolute",
                  right: -180,
                  top: `calc(50% + ${offsetY}px)`,
                  transform: `translateX(${docX}px) translateY(-50%)`,
                  opacity: docOpacity,
                  display: "flex", alignItems: "center", gap: 8,
                  ...glass,
                  padding: "10px 16px",
                }}>
                  {i === 0 && <FileCode size={18} color={colors.primary} />}
                  {i === 1 && <FileText size={18} color={colors.accent} />}
                  {i === 2 && <FileCheck size={18} color={colors.warning} />}
                  <span style={{
                    fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.foreground,
                  }}>
                    {doc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PHASE 3: VRAM Consumed ===== */}
      {currentPhase === 3 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1, opacity: phase3Opacity, gap: 24, padding: "60px 140px",
        }}>
          <div style={{
            fontFamily: inter, fontSize: 15, fontWeight: 600, color: colors.mutedForeground,
            textTransform: "uppercase" as const, letterSpacing: 3,
            opacity: vramBarSpring,
            transform: `translateY(${interpolate(vramBarSpring, [0, 1], [20, 0])}px)`,
          }}>
            GPU VRAM Allocation
          </div>

          {/* VRAM Bar */}
          <div style={{
            width: "100%", maxWidth: 800,
            opacity: vramBarSpring,
            transform: `translateY(${interpolate(vramBarSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{
              width: "100%", height: 64, borderRadius: 12,
              backgroundColor: colors.muted,
              border: `1px solid ${colors.border}`,
              overflow: "visible",
              position: "relative",
            }}>
              {/* Model Weights segment */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${weightsProgress * 100}%`,
                backgroundColor: "#93c5fd",
                borderRadius: "12px 0 0 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRight: weightsProgress > 0.01 ? `1px solid ${colors.border}` : "none",
              }}>
                {weightsProgress > 0.15 && (
                  <span style={{
                    fontFamily: inter, fontSize: 12, fontWeight: 700, color: colors.primaryDark,
                  }}>
                    Model Weights
                  </span>
                )}
              </div>

              {/* KV Cache segment */}
              <div style={{
                position: "absolute", left: `${weightsProgress * 100}%`, top: 0, bottom: 0,
                width: `${Math.min(kvCacheProgress * 80, (1 - weightsProgress) * 100)}%`,
                backgroundColor: interpolate(kvCacheProgress, [0, 0.5, 1], [0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) > 0.5
                  ? "#fca5a5" : "#fcd34d",
                borderRadius: kvCacheProgress * 80 + weightsProgress * 100 >= 98 ? "0 12px 12px 0" : 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {kvCacheProgress > 0.2 && (
                  <span style={{
                    fontFamily: inter, fontSize: 12, fontWeight: 700,
                    color: kvCacheProgress > 0.7 ? colors.destructive : colors.warning,
                  }}>
                    KV Cache
                  </span>
                )}
              </div>

              {/* Overflow indicator */}
              {overflow > 0 && (
                <div style={{
                  position: "absolute", right: -8, top: -4, bottom: -4,
                  width: interpolate(overflow, [0, 0.3], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  backgroundColor: `${colors.destructive}30`,
                  borderRadius: "0 12px 12px 0",
                  border: `2px dashed ${colors.destructive}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertTriangle size={16} color={colors.destructive} style={{
                    opacity: overflowWarningSpring,
                  }} />
                </div>
              )}
            </div>

            {/* Stat callouts */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <div style={{
                opacity: stat1Spring,
                transform: `translateY(${stat1Y}px)`,
                ...glass, padding: "10px 20px",
                borderLeft: `3px solid ${colors.warning}`,
              }}>
                <div style={{ fontFamily: montserrat, fontSize: 20, fontWeight: 900, color: colors.warning }}>
                  5 GB
                </div>
                <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 500, color: colors.mutedForeground }}>
                  KV Cache @ 32K context
                </div>
              </div>
              <div style={{
                opacity: stat2Spring,
                transform: `translateY(${stat2Y}px)`,
                ...glass, padding: "10px 20px",
                borderLeft: `3px solid ${colors.destructive}`,
              }}>
                <div style={{ fontFamily: montserrat, fontSize: 20, fontWeight: 900, color: colors.destructive }}>
                  80 GB
                </div>
                <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 500, color: colors.mutedForeground }}>
                  KV Cache @ 70B model
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PHASE 4: Swap & Crawl ===== */}
      {currentPhase === 4 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1, opacity: phase4Opacity, gap: 20, padding: "60px 140px",
        }}>
          <div style={{
            fontFamily: inter, fontSize: 15, fontWeight: 600, color: colors.mutedForeground,
            textTransform: "uppercase" as const, letterSpacing: 3,
            opacity: sysRamSpring,
            transform: `translateY(${interpolate(sysRamSpring, [0, 1], [20, 0])}px)`,
          }}>
            Memory Overflow
          </div>

          <div style={{ width: "100%", maxWidth: 750, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* VRAM bar (full) */}
            <div style={{
              opacity: sysRamSpring,
              transform: `translateY(${sysRamY}px)`,
            }}>
              <div style={{
                fontFamily: inter, fontSize: 12, fontWeight: 700, color: colors.foreground,
                marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 1,
              }}>
                GPU VRAM
              </div>
              <div style={{
                width: "100%", height: 48, borderRadius: 10,
                backgroundColor: colors.muted,
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: "100%",
                  background: `linear-gradient(90deg, #93c5fd 20%, #fca5a5 20%, #fca5a5 100%)`,
                  borderRadius: 10,
                }} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: inter, fontSize: 13, fontWeight: 700, color: colors.destructive,
                  }}>
                    FULL — No headroom
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              display: "flex", justifyContent: "center",
              opacity: arrowSpring,
            }}>
              <ArrowDown size={28} color={colors.destructive} />
            </div>

            {/* System RAM bar */}
            <div style={{
              opacity: sysRamSpring,
              transform: `translateY(${sysRamY}px)`,
            }}>
              <div style={{
                fontFamily: inter, fontSize: 12, fontWeight: 700, color: colors.mutedForeground,
                marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 1,
              }}>
                System RAM (slow)
              </div>
              <div style={{
                width: "100%", height: 48, borderRadius: 10,
                backgroundColor: "#f8fafc",
                border: `1px dashed ${colors.border}`,
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${spillProgress * 100}%`,
                  backgroundColor: "#fecaca",
                  borderRadius: 10,
                  opacity: 0.6,
                }} />
                {spillProgress > 0.1 && (
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    paddingLeft: 16,
                  }}>
                    <span style={{
                      fontFamily: inter, fontSize: 12, fontWeight: 600, color: colors.mutedForeground,
                    }}>
                      Overflow spilling...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Throughput indicator */}
          <div style={{
            opacity: throughputSpring,
            transform: `translateY(${interpolate(throughputSpring, [0, 1], [20, 0])}px)`,
            ...glass, padding: "20px 40px",
            display: "flex", alignItems: "center", gap: 24,
            borderTop: `3px solid ${throughputValue < 30 ? colors.destructive : colors.warning}`,
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{
                fontFamily: montserrat, fontSize: 40, fontWeight: 900,
                color: throughputValue < 30 ? colors.destructive : colors.warning,
                lineHeight: 1,
              }}>
                {Math.round(throughputValue)}%
              </span>
              <span style={{
                fontFamily: inter, fontSize: 12, fontWeight: 600, color: colors.mutedForeground, marginTop: 4,
              }}>
                Throughput
              </span>
            </div>

            {/* Mini chart showing decline */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 50 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const barVal = interpolate(
                  frame,
                  [throughputStart + i * 3, throughputEnd],
                  [100 - i * 2, Math.max(8, 100 - i * 12)],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const h = interpolate(barVal, [0, 100], [4, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const barHue = interpolate(barVal, [0, 50, 100], [0, 45, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={i} style={{
                    width: 8, height: h, borderRadius: 3,
                    backgroundColor: `hsl(${barHue}, 70%, 55%)`,
                    opacity: throughputSpring,
                  }} />
                );
              })}
            </div>

            <div style={{
              fontFamily: inter, fontSize: 14, fontWeight: 600, color: colors.destructive,
              maxWidth: 180,
            }}>
              System crawls to a halt
            </div>
          </div>
        </div>
      )}

      {/* ===== PHASE 5: Output Degrades ===== */}
      {currentPhase === 5 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1, opacity: phase5Opacity, gap: 28, padding: "60px 160px",
        }}>
          <div style={{
            fontFamily: inter, fontSize: 15, fontWeight: 600, color: colors.mutedForeground,
            textTransform: "uppercase" as const, letterSpacing: 3,
            opacity: outputSpring,
            transform: `translateY(${interpolate(outputSpring, [0, 1], [20, 0])}px)`,
          }}>
            AI Output Quality
          </div>

          <div style={{
            opacity: outputSpring,
            transform: `translateY(${outputY}px)`,
            ...glass,
            padding: "28px 36px",
            maxWidth: 700,
            width: "100%",
            border: degradeProgress > 0.5
              ? `2px solid ${colors.destructive}30`
              : `1px solid rgba(0, 0, 0, 0.08)`,
          }}>
            <div style={{
              fontFamily: inter, fontSize: 15, fontWeight: 500, color: colors.foreground,
              lineHeight: 2.0,
            }}>
              {outputWords.map((word, i) => {
                if (!word.degrade) {
                  return (
                    <span key={i} style={{ color: colors.foreground }}>
                      {word.text}
                    </span>
                  );
                }
                const wordDegradeThreshold = (i / outputWords.length);
                const isDegraded = degradeProgress > wordDegradeThreshold;
                const fadeOut = isDegraded
                  ? interpolate(
                      degradeProgress,
                      [wordDegradeThreshold, wordDegradeThreshold + 0.15],
                      [1, 0],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )
                  : 1;
                return (
                  <span key={i} style={{ position: "relative", display: "inline" }}>
                    <span style={{
                      opacity: fadeOut,
                      color: colors.primary,
                      fontWeight: 700,
                      backgroundColor: `${colors.primary}08`,
                      padding: "1px 4px",
                      borderRadius: 4,
                    }}>
                      {word.text}
                    </span>
                    {fadeOut < 0.5 && (
                      <span style={{
                        color: colors.destructive,
                        fontWeight: 600,
                        opacity: interpolate(fadeOut, [0, 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      }}>
                        ...
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Final label */}
          <div style={{
            opacity: finalLabelSpring,
            transform: `translateY(${finalLabelY}px)`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 2, backgroundColor: colors.destructive, borderRadius: 1,
            }} />
            <span style={{
              fontFamily: inter, fontSize: 18, fontWeight: 700, color: colors.foreground,
            }}>
              The model weights aren't the problem —{" "}
              <span style={{ color: colors.destructive }}>the KV Cache is.</span>
            </span>
            <div style={{
              width: 40, height: 2, backgroundColor: colors.destructive, borderRadius: 1,
            }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};