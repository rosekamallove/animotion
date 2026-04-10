import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CheckCircle } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#000000",
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

const barData = [
  { float16: 0.8347, int3: 5, height: 380 },
  { float16: 0.4215, int3: 3, height: 200 },
  { float16: 0.9563, int3: 7, height: 420 },
  { float16: 0.7128, int3: 6, height: 320 },
  { float16: 0.2891, int3: 2, height: 140 },
  { float16: 0.5674, int3: 4, height: 260 },
  { float16: 0.9102, int3: 7, height: 400 },
  { float16: 0.6483, int3: 5, height: 300 },
];

const generateSmoothPath = (width: number, height: number, offsetX: number, offsetY: number): string => {
  const points: string[] = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const x = offsetX + (i / steps) * width;
    const y =
      offsetY +
      height / 2 -
      Math.sin((i / steps) * Math.PI * 3.2) * (height * 0.32) -
      Math.sin((i / steps) * Math.PI * 1.5) * (height * 0.15) +
      Math.cos((i / steps) * Math.PI * 5) * (height * 0.06);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
};

const generateSteppedPath = (width: number, height: number, offsetX: number, offsetY: number): string => {
  const points: string[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y =
      offsetY +
      height / 2 -
      Math.sin(t * Math.PI * 3.2) * (height * 0.32) -
      Math.sin(t * Math.PI * 1.5) * (height * 0.15) +
      Math.cos(t * Math.PI * 5) * (height * 0.06);
    const quantizedY = Math.round(y / 12) * 12;
    const x1 = offsetX + t * width;
    const x2 = offsetX + Math.min((i + 1) / steps, 1) * width;
    if (i === 0) {
      points.push(`M ${x1.toFixed(1)} ${quantizedY.toFixed(1)}`);
    } else {
      points.push(`L ${x1.toFixed(1)} ${quantizedY.toFixed(1)}`);
    }
    if (i < steps) {
      points.push(`L ${x2.toFixed(1)} ${quantizedY.toFixed(1)}`);
    }
  }
  return points.join(" ");
};

export const QuantizationExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing
  const titleStart = 0;
  const barsStart = Math.round(2 * fps);
  const scanStart = Math.round(6 * fps);
  const memoryStart = Math.round(12 * fps);
  const splitStart = Math.round(18 * fps);
  const signalStart = Math.round(21 * fps);
  const overlayStart = Math.round(25 * fps);
  const fadeOutStart = Math.round(27.2 * fps);

  // Global fade out
  const globalOpacity = interpolate(frame, [fadeOutStart, fadeOutStart + Math.round(0.8 * fps)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PHASE 1: Title ===
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    delay: titleStart + Math.round(0.2 * fps),
  });
  const titleY = interpolate(titleSpring, [0, 1], [-80, 0]);

  const subtitleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: titleStart + Math.round(0.5 * fps),
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [20, 0]);

  // Title exit (when splitting)
  const titleExit = interpolate(frame, [splitStart, splitStart + Math.round(0.5 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PHASE 2: 16-bit Bars ===
  const barSprings = barData.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 100 },
      delay: barsStart + i * Math.round(0.08 * fps),
    })
  );

  const labelSprings = barData.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 8, stiffness: 150 },
      delay: barsStart + Math.round(0.6 * fps) + i * Math.round(0.08 * fps),
    })
  );

  const badge16Spring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: barsStart + Math.round(1.5 * fps),
  });

  // === PHASE 3: Scan & Transform ===
  const scanProgress = interpolate(frame, [scanStart, scanStart + Math.round(1.8 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scanVisible = frame >= scanStart && frame < scanStart + Math.round(2.5 * fps);

  const barCrushSprings = barData.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 8, stiffness: 250 },
      delay: scanStart + Math.round(0.2 * fps) + i * Math.round(0.2 * fps),
    })
  );

  const intLabelSprings = barData.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 160 },
      delay: scanStart + Math.round(0.5 * fps) + i * Math.round(0.2 * fps),
    })
  );

  // Badge swap
  const badge16Exit = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: scanStart + Math.round(2.5 * fps),
  });
  const badge3Spring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    delay: scanStart + Math.round(3.0 * fps),
  });

  // === PHASE 4: Memory Counter ===
  const memCardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: memoryStart + Math.round(0.3 * fps),
  });

  const counterStartFrame = memoryStart + Math.round(1.0 * fps);
  const counterEndFrame = memoryStart + Math.round(4.0 * fps);
  const memoryValue = interpolate(frame, [counterStartFrame, counterEndFrame], [16, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const memoryBarWidth = interpolate(frame, [counterStartFrame, counterEndFrame], [100, 18.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const counterFlash =
    frame >= counterEndFrame && frame < counterEndFrame + 3
      ? 1
      : 0;

  const savingsSpring = spring({
    frame,
    fps,
    config: { damping: 6, stiffness: 200 },
    delay: counterEndFrame + 4,
  });
  const savingsScale = interpolate(savingsSpring, [0, 1], [0.2, 1]);

  // === PHASE 5: Layout Split ===
  const barsExitY = interpolate(frame, [splitStart, splitStart + Math.round(0.6 * fps)], [0, -1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dividerDraw = interpolate(frame, [splitStart + Math.round(0.5 * fps), splitStart + Math.round(1.5 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const panel16Spring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: splitStart + Math.round(1.0 * fps),
  });
  const panel3Spring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: splitStart + Math.round(1.2 * fps),
  });

  // === PHASE 6: Signal Curves ===
  const smoothDraw = interpolate(frame, [signalStart, signalStart + Math.round(1.5 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const steppedDraw = interpolate(frame, [signalStart + Math.round(0.5 * fps), signalStart + Math.round(2.0 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === PHASE 7: Overlay ===
  const dividerRetract = interpolate(frame, [overlayStart, overlayStart + Math.round(0.6 * fps)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overlaySlide = interpolate(frame, [overlayStart, overlayStart + Math.round(0.8 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nearlySpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    delay: overlayStart + Math.round(1.2 * fps),
  });

  const isPhase5Plus = frame >= splitStart;
  const isPhase7 = frame >= overlayStart;
  const showBars = !isPhase5Plus || barsExitY > -1200;

  const effectiveDivider = isPhase7 ? dividerRetract * dividerDraw : dividerDraw;

  const barGroupX = 960 - ((barData.length * 80 + (barData.length - 1) * 24) / 2);
  const barBottom = 680;

  const smoothPathWidth = 700;
  const smoothPathHeight = 300;

  const smoothPathLeft = generateSmoothPath(smoothPathWidth, smoothPathHeight, 0, 0);
  const steppedPath = generateSteppedPath(smoothPathWidth, smoothPathHeight, 0, 0);

  const smoothTotalLength = 1200;
  const steppedTotalLength = 1400;

  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", opacity: globalOpacity }}>
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.3 }} />

      {/* TITLE */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          opacity: 1 - titleExit,
          transform: `translateY(${titleY - titleExit * 60}px)`,
        }}
      >
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 72,
            fontWeight: 900,
            color: colors.primary,
            letterSpacing: 6,
            textShadow: `0 0 ${30 * glowPulse}px ${colors.primary}40`,
            opacity: titleSpring,
          }}
        >
          QUANTIZATION
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(226, 232, 240, 0.6)",
            marginTop: 8,
            opacity: subtitleSpring,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          16-bit &nbsp;→&nbsp; 3-bit
        </div>
      </div>

      {/* BARS SECTION */}
      {showBars && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            transform: `translateY(${barsExitY}px)`,
          }}
        >
          {/* Badge 16-BIT */}
          <div
            style={{
              position: "absolute",
              top: 170,
              left: barGroupX - 20,
              opacity: badge16Spring * (1 - badge16Exit),
              transform: `translateX(${interpolate(badge16Spring, [0, 1], [-40, 0]) + badge16Exit * 80}px)`,
              zIndex: 8,
            }}
          >
            <div
              style={{
                ...glass,
                padding: "8px 20px",
                borderRadius: 30,
                border: `1px solid ${colors.primary}40`,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  boxShadow: `0 0 8px ${colors.primary}`,
                }}
              />
              <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 700, color: colors.primary, letterSpacing: 2 }}>
                16-BIT FLOAT
              </span>
            </div>
          </div>

          {/* Badge 3-BIT */}
          <div
            style={{
              position: "absolute",
              top: 170,
              left: barGroupX - 20,
              opacity: badge3Spring,
              transform: `translateX(${interpolate(badge3Spring, [0, 1], [-40, 0])}px)`,
              zIndex: 8,
            }}
          >
            <div
              style={{
                ...glass,
                padding: "8px 20px",
                borderRadius: 30,
                border: `1px solid ${colors.accent}40`,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.accent,
                  boxShadow: `0 0 8px ${colors.accent}`,
                }}
              />
              <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 700, color: colors.accent, letterSpacing: 2 }}>
                3-BIT INT
              </span>
            </div>
          </div>

          {/* Bars */}
          {barData.map((bar, i) => {
            const barX = barGroupX + i * (80 + 24);
            const growProgress = barSprings[i];
            const crushProgress = barCrushSprings[i];
            const currentHeight = interpolate(crushProgress, [0, 1], [bar.height * growProgress, bar.height * 0.2]);
            const barColor = interpolate(crushProgress, [0, 0.5, 1], [0, 0, 1]);
            const r = interpolate(barColor, [0, 1], [0, 168]);
            const g = interpolate(barColor, [0, 1], [212, 85]);
            const b = interpolate(barColor, [0, 1], [255, 247]);

            const labelFloatOpacity = labelSprings[i] * (1 - intLabelSprings[i]);
            const labelIntOpacity = intLabelSprings[i];
            const labelIntScale = interpolate(intLabelSprings[i], [0, 1], [0.3, 1]);

            const barTopY = barBottom - currentHeight;

            return (
              <React.Fragment key={i}>
                {/* Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: barX,
                    bottom: 1080 - barBottom,
                    width: 80,
                    height: Math.max(currentHeight, 0),
                    borderRadius: "8px 8px 4px 4px",
                    background: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.8)`,
                    boxShadow: `0 0 ${12 * glowPulse}px rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.3)`,
                    transformOrigin: "bottom center",
                  }}
                >
                  {/* Top highlight */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      borderRadius: "8px 8px 0 0",
                      background: `rgba(${Math.round(r + 40)}, ${Math.round(g + 40)}, ${Math.round(b)}, 1)`,
                    }}
                  />
                </div>

                {/* Float label */}
                <div
                  style={{
                    position: "absolute",
                    left: barX,
                    top: barTopY - 36,
                    width: 80,
                    textAlign: "center",
                    opacity: labelFloatOpacity,
                    transform: `scale(${interpolate(labelSprings[i], [0, 1], [0.5, 1])})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.white,
                    }}
                  >
                    {bar.float16.toFixed(4)}
                  </span>
                </div>

                {/* Int label */}
                <div
                  style={{
                    position: "absolute",
                    left: barX,
                    top: barTopY - 42,
                    width: 80,
                    textAlign: "center",
                    opacity: labelIntOpacity,
                    transform: `scale(${labelIntScale})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 28,
                      fontWeight: 700,
                      color: colors.warning,
                      textShadow: `0 0 12px ${colors.warning}50`,
                    }}
                  >
                    {bar.int3}
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Scan Line */}
          {scanVisible && (
            <div
              style={{
                position: "absolute",
                left: barGroupX - 20,
                top: interpolate(scanProgress, [0, 1], [barBottom - 440, barBottom + 10]),
                width: barData.length * 80 + (barData.length - 1) * 24 + 40,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.primary}, transparent)`,
                boxShadow: `0 0 20px ${colors.primary}80, 0 0 60px ${colors.primary}40`,
                opacity: scanProgress < 1 ? 1 : 0,
                zIndex: 9,
              }}
            />
          )}

          {/* Memory Counter Card */}
          <div
            style={{
              position: "absolute",
              bottom: 1080 - barBottom - 280,
              left: "50%",
              transform: `translateX(-50%) translateY(${interpolate(memCardSpring, [0, 1], [60, 0])}px)`,
              opacity: memCardSpring,
              zIndex: 6,
            }}
          >
            <div
              style={{
                ...glass,
                padding: "24px 48px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                minWidth: 360,
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                }}
              >
                MEMORY / VALUE
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 64,
                    fontWeight: 700,
                    color: counterFlash ? colors.white : colors.primary,
                    textShadow: counterFlash
                      ? `0 0 30px ${colors.white}`
                      : `0 0 20px ${colors.primary}40`,
                    lineHeight: 1,
                  }}
                >
                  {Math.round(memoryValue)}
                </span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 22,
                    fontWeight: 400,
                    color: "rgba(226, 232, 240, 0.6)",
                  }}
                >
                  bytes
                </span>
              </div>

              {/* Memory bar */}
              <div
                style={{
                  width: 280,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${memoryBarWidth}%`,
                    height: "100%",
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${colors.success}, ${interpolate(memoryBarWidth, [18.75, 100], [0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) > 0.5 ? colors.success : colors.primary})`,
                    boxShadow: `0 0 10px ${colors.success}40`,
                  }}
                />
              </div>

              {/* 5.3x Smaller */}
              {savingsSpring > 0 && (
                <div
                  style={{
                    opacity: savingsSpring,
                    transform: `scale(${savingsScale})`,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: montserrat,
                      fontSize: 32,
                      fontWeight: 700,
                      color: colors.success,
                      textShadow: `0 0 20px ${colors.success}50`,
                    }}
                  >
                    5.3× SMALLER
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5-7: Signal Comparison */}
      {isPhase5Plus && (
        <div style={{ position: "absolute", inset: 0, zIndex: 7 }}>
          {/* Divider line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "10%",
              width: 2,
              height: `${effectiveDivider * 80}%`,
              backgroundColor: "rgba(255,255,255,0.3)",
              transform: "translateX(-50%)",
              zIndex: 8,
            }}
          />

          {/* Left panel: Original */}
          <div
            style={{
              position: "absolute",
              left: isPhase7 ? interpolate(overlaySlide, [0, 1], [60, 200]) : 60,
              top: 160,
              width: isPhase7 ? interpolate(overlaySlide, [0, 1], [860, 1520]) : 860,
              height: 700,
              opacity: panel16Spring,
              transform: `translateX(${interpolate(panel16Spring, [0, 1], [-30, 0])}px)`,
            }}
          >
            <div
              style={{
                ...glass,
                width: "100%",
                height: "100%",
                padding: "32px 40px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.primary,
                  letterSpacing: 2,
                }}
              >
                16-BIT ORIGINAL
              </div>
              <svg
                width={smoothPathWidth}
                height={smoothPathHeight}
                viewBox={`0 0 ${smoothPathWidth} ${smoothPathHeight}`}
                style={{ overflow: "visible", marginTop: 40 }}
              >
                <path
                  d={smoothPathLeft}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={3}
                  strokeDasharray={smoothTotalLength}
                  strokeDashoffset={interpolate(smoothDraw, [0, 1], [smoothTotalLength, 0])}
                  style={{
                    filter: `drop-shadow(0 0 ${6 * glowPulse}px ${colors.primary}60)`,
                  }}
                />
                {/* Overlay stepped path in phase 7 */}
                {isPhase7 && overlaySlide > 0.2 && (
                  <path
                    d={steppedPath}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={3}
                    strokeDasharray={steppedTotalLength}
                    strokeDashoffset={0}
                    opacity={interpolate(overlaySlide, [0.2, 1], [0, 0.9], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })}
                    style={{
                      filter: `drop-shadow(0 0 8px ${colors.accent}60)`,
                    }}
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Right panel: Quantized (hide during overlay) */}
          {!isPhase7 && (
            <div
              style={{
                position: "absolute",
                right: 60,
                top: 160,
                width: 860,
                height: 700,
                opacity: panel3Spring,
                transform: `translateX(${interpolate(panel3Spring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  ...glass,
                  width: "100%",
                  height: "100%",
                  padding: "32px 40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 20,
                    fontWeight: 700,
                    color: colors.accent,
                    letterSpacing: 2,
                  }}
                >
                  3-BIT QUANTIZED
                </div>
                <svg
                  width={smoothPathWidth}
                  height={smoothPathHeight}
                  viewBox={`0 0 ${smoothPathWidth} ${smoothPathHeight}`}
                  style={{ overflow: "visible", marginTop: 40 }}
                >
                  <path
                    d={steppedPath}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={3}
                    strokeDasharray={steppedTotalLength}
                    strokeDashoffset={interpolate(steppedDraw, [0, 1], [steppedTotalLength, 0])}
                    style={{
                      filter: `drop-shadow(0 0 ${6 * glowPulse}px ${colors.accent}60)`,
                    }}
                  />
                </svg>
              </div>
            </div>
          )}

          {/* NEARLY IDENTICAL label */}
          {nearlySpring > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 100,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                opacity: nearlySpring,
                transform: `scale(${interpolate(nearlySpring, [0, 1], [0.4, 1])}) translateY(${interpolate(nearlySpring, [0, 1], [20, 0])}px)`,
                zIndex: 10,
              }}
            >
              <CheckCircle size={36} color={colors.success} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: montserrat,
                  fontSize: 40,
                  fontWeight: 700,
                  color: colors.success,
                  textShadow: `0 0 24px ${colors.success}50`,
                  letterSpacing: 3,
                }}
              >
                NEARLY IDENTICAL
              </span>
            </div>
          )}

          {/* Legend during overlay */}
          {isPhase7 && overlaySlide > 0.5 && (
            <div
              style={{
                position: "absolute",
                top: 180,
                right: 100,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: interpolate(overlaySlide, [0.5, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />
                <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: colors.primary }}>
                  16-bit Original
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 3, backgroundColor: colors.accent, borderRadius: 2 }} />
                <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: colors.accent }}>
                  3-bit Quantized
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};