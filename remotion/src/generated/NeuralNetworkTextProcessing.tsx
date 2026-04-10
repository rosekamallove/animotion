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

const tokens = [
  { label: "He", small: false },
  { label: "ll", small: false },
  { label: "lo", small: false },
  { label: "<SEP>", small: true },
  { label: "<EOS>", small: true },
];

const bonjourLetters = ["B", "o", "n", "j", "o", "u", "r"];

const layerLabels = ["Encoder Layer 1", "Encoder Layer 2", "Encoder Layer 3"];
const layerYPositions = [390, 510, 630];

export const NeuralNetworkTextProcessing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ========== PHASE 1: Hello Entrance (0s - 1.5s) ==========
  const helloSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    delay: Math.round(0.2 * fps),
  });
  const helloScale = interpolate(helloSpring, [0, 1], [0.6, 1]);
  const helloGlow = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.4, 1]);

  // Hello disappears at tokenization
  const helloFadeOut = interpolate(
    frame,
    [Math.round(1.4 * fps), Math.round(1.6 * fps)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const helloFlash = interpolate(
    frame,
    [Math.round(1.4 * fps), Math.round(1.5 * fps), Math.round(1.6 * fps)],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ========== PHASE 2: Tokenization Shatter (1.5s - 3.2s) ==========
  const tokenStartFrame = Math.round(1.5 * fps);
  const tokenStackX = 280;
  const tokenStackCenterY = 540;
  const tokenSpacing = 80;
  const tokenStartYs = tokens.map(
    (_, i) => tokenStackCenterY - ((tokens.length - 1) / 2) * tokenSpacing + i * tokenSpacing
  );

  const tokenSprings = tokens.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 120 },
      delay: tokenStartFrame + i * 2,
    })
  );

  // Token ID label
  const tokenIdLabelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: tokenStartFrame + 12,
  });

  // ========== PHASE 3: Token Flight (3.2s - 5s) ==========
  const flightStartFrame = Math.round(3.2 * fps);
  const flightEndFrame = Math.round(4.5 * fps);
  const layerLeftX = 720;

  const tokenFlightProgress = tokens.map((_, i) => {
    const delay = i * 3;
    return interpolate(
      frame,
      [flightStartFrame + delay, flightEndFrame + delay - 6],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  });

  const tokenAbsorbed = tokens.map((_, i) => {
    const delay = i * 3;
    return frame >= flightEndFrame + delay - 6;
  });

  // ========== PHASE 4-6: Layer Processing ==========
  const layerProcessingStarts = [
    Math.round(4.5 * fps),
    Math.round(5.5 * fps),
    Math.round(6.5 * fps),
  ];
  const layerProcessingDurations = [
    Math.round(0.8 * fps),
    Math.round(0.7 * fps),
    Math.round(0.6 * fps),
  ];

  const layerActivation = layerLabels.map((_, i) => {
    const start = layerProcessingStarts[i];
    const dur = layerProcessingDurations[i];
    const progress = interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const isActive = frame >= start && frame <= start + dur + 10;
    const isComplete = frame > start + dur + 10;
    return { progress, isActive, isComplete };
  });

  // Layers entrance
  const layerEntranceSprings = layerLabels.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 100 },
      delay: Math.round(0.5 * fps) + i * 4,
    })
  );

  // ========== PHASE 7: Bonjour Letter Assembly (7.5s - 9.2s) ==========
  const bonjourStartFrame = Math.round(7.5 * fps);
  const letterSpacing = 7;
  const bonjourBaseX = 1340;

  const letterSprings = bonjourLetters.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 10, stiffness: 140 },
      delay: bonjourStartFrame + i * letterSpacing,
    })
  );

  const letterScales = letterSprings.map((s) => interpolate(s, [0, 1], [1.6, 1]));

  // ========== PHASE 8: Translation Complete Badge (9.2s - 10s) ==========
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150, mass: 1.1 },
    delay: Math.round(9.2 * fps),
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  const badgePulseRingScale = interpolate(
    badgeSpring,
    [0, 0.5, 1],
    [1, 1.5, 2.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const badgePulseRingOpacity = interpolate(badgeSpring, [0, 0.5, 1], [0.6, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Screen flash
  const screenFlash = interpolate(
    frame,
    [Math.round(9.2 * fps), Math.round(9.4 * fps), Math.round(9.6 * fps)],
    [0, 0.04, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ========== PARTICLES ==========
  const particleSeeds: { x: number; y: number; r: number; angle: number; speed: number; color: string }[] = [];
  for (let i = 0; i < 28; i++) {
    const seed = (i * 137.508) % 360;
    particleSeeds.push({
      x: 1400 + (Math.sin(seed) * 180 + ((i * 47) % 200)),
      y: 320 + ((i * 73) % 400),
      r: 2 + (i % 4),
      angle: seed,
      speed: 0.5 + (i % 3) * 0.3,
      color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.accentLight,
    });
  }

  const particlePhaseStart = Math.round(6.8 * fps);
  const particlePhaseEnd = Math.round(8.5 * fps);
  const particleProgress = interpolate(frame, [particlePhaseStart, particlePhaseEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Layer burst particles (after layer 3 completes)
  const burstStartFrame = Math.round(7.3 * fps);
  const burstProgress = interpolate(frame, [burstStartFrame, burstStartFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstOpacity = interpolate(frame, [burstStartFrame, burstStartFrame + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      {/* Grid background */}
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.3 }} />

      {/* Ambient glow orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`,
          left: 100,
          top: 200,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
          right: 100,
          top: 300,
          filter: "blur(60px)",
        }}
      />

      {/* ===== HELLO WORD ===== */}
      {helloFadeOut > 0 && (
        <div
          style={{
            position: "absolute",
            left: 320,
            top: 540,
            transform: `translate(-50%, -50%) scale(${helloScale})`,
            opacity: helloSpring * helloFadeOut,
            fontFamily: montserrat,
            fontSize: 96,
            fontWeight: 900,
            color: colors.white,
            textShadow: `0 0 ${30 * helloGlow}px ${colors.primary}60, 0 0 ${60 * helloGlow}px ${colors.primary}20`,
            zIndex: 10,
          }}
        >
          Hello
        </div>
      )}

      {/* Hello flash effect */}
      {helloFlash > 0 && (
        <div
          style={{
            position: "absolute",
            left: 320,
            top: 540,
            transform: "translate(-50%, -50%)",
            width: 300,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primary}${Math.round(helloFlash * 80).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            zIndex: 9,
          }}
        />
      )}

      {/* ===== TOKEN BOXES ===== */}
      {tokens.map((token, i) => {
        const appeared = tokenSprings[i] > 0.01;
        if (!appeared) return null;
        if (tokenAbsorbed[i]) return null;

        const flight = tokenFlightProgress[i];
        const stackX = tokenStackX;
        const stackY = tokenStartYs[i];
        const targetX = layerLeftX;
        const targetY = layerYPositions[0];

        const arcHeight = -60 + i * 15;
        const currentX = interpolate(flight, [0, 1], [stackX, targetX]);
        const currentY =
          interpolate(flight, [0, 1], [stackY, targetY]) +
          Math.sin(flight * Math.PI) * arcHeight;

        const tokenScale = interpolate(tokenSprings[i], [0, 1], [0.3, 1]);
        const flightScale = flight > 0.8 ? interpolate(flight, [0.8, 1], [1, 0.3]) : 1;
        const flightOpacity = flight > 0.9 ? interpolate(flight, [0.9, 1], [1, 0]) : 1;

        const motionBlur = flight > 0 && flight < 0.9 ? flight * 20 : 0;

        return (
          <div
            key={`token-${i}`}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              transform: `translate(-50%, -50%) scale(${tokenScale * flightScale})`,
              opacity: tokenSprings[i] * flightOpacity,
              zIndex: 20 - i,
            }}
          >
            <div
              style={{
                ...glass,
                padding: "14px 24px",
                border: `1.5px solid ${colors.primary}80`,
                background: `rgba(0, 212, 255, 0.08)`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: token.small ? 90 : 80,
                boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3)${motionBlur > 0 ? `, ${motionBlur}px 0 ${motionBlur * 1.5}px ${colors.primary}20` : ""}`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: token.small ? 11 : 14,
                  fontWeight: 600,
                  color: colors.primary,
                  letterSpacing: 1,
                }}
              >
                {token.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Token ID Label */}
      {tokenIdLabelSpring > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: tokenStackX,
            top: tokenStartYs[0] - 60,
            transform: "translateX(-50%)",
            opacity: tokenIdLabelSpring * (frame < flightStartFrame + 20 ? 1 : interpolate(frame, [flightStartFrame + 20, flightStartFrame + 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
            fontFamily: inter,
            fontSize: 11,
            fontWeight: 400,
            color: "#6b7280",
            textTransform: "uppercase" as const,
            letterSpacing: 3,
          }}
        >
          TOKEN IDS
        </div>
      )}

      {/* ===== CONNECTION LINES (simplified as animated dots) ===== */}
      {frame >= tokenStartFrame + 10 && frame < flightStartFrame + 10 && (
        <svg
          style={{ position: "absolute", inset: 0, zIndex: 5 }}
          width={1920}
          height={1080}
        >
          {tokens.map((_, i) => {
            const lineProgress = interpolate(
              frame,
              [tokenStartFrame + 10 + i * 2, tokenStartFrame + 30 + i * 2],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const lineOpacity = interpolate(
              frame,
              [flightStartFrame - 5, flightStartFrame + 5],
              [0.25, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const startX = tokenStackX + 60;
            const startY = tokenStartYs[i];
            const endX = layerLeftX;
            const endY = layerYPositions[0];
            const dashOffset = interpolate(lineProgress, [0, 1], [300, 0]);
            return (
              <line
                key={`line-${i}`}
                x1={startX}
                y1={startY}
                x2={startX + (endX - startX) * lineProgress}
                y2={startY + (endY - startY) * lineProgress}
                stroke={`rgba(0, 212, 255, ${lineOpacity})`}
                strokeWidth={1}
                strokeDasharray="6 4"
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
      )}

      {/* ===== LAYER RECTANGLES ===== */}
      {layerLabels.map((label, i) => {
        const entrance = layerEntranceSprings[i];
        const { progress, isActive, isComplete } = layerActivation[i];
        const layerY = layerYPositions[i];

        const borderColor = isActive
          ? colors.accent
          : isComplete
          ? `${colors.success}80`
          : `rgba(168, 85, 247, 0.4)`;

        const bgColor = isActive
          ? `rgba(168, 85, 247, 0.12)`
          : isComplete
          ? `rgba(34, 197, 94, 0.05)`
          : `rgba(255, 255, 255, 0.04)`;

        const glowAmount = isActive ? interpolate(Math.sin(frame * 0.2), [-1, 1], [8, 20]) : 0;

        const layerFlash = i === 2 && frame >= layerProcessingStarts[2] && frame <= layerProcessingStarts[2] + 8
          ? interpolate(Math.sin(frame * 1.5), [-1, 1], [0.5, 1])
          : 0;

        return (
          <div
            key={`layer-${i}`}
            style={{
              position: "absolute",
              left: 960,
              top: layerY,
              transform: `translate(-50%, -50%) scale(${interpolate(entrance, [0, 1], [0.7, 1])})`,
              opacity: entrance,
              zIndex: 8,
            }}
          >
            <div
              style={{
                width: 480,
                height: 90,
                borderRadius: 14,
                background: bgColor,
                border: `1.5px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: isActive
                  ? `0 0 ${glowAmount}px ${colors.accent}40, inset 0 0 ${glowAmount * 0.5}px ${colors.accent}15`
                  : layerFlash > 0
                  ? `0 0 ${20 * layerFlash}px ${colors.accent}60`
                  : "0 4px 24px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Progress bar */}
              {(isActive || isComplete) && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: 3,
                    width: `${Math.min(progress * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                    borderRadius: "0 2px 2px 0",
                    boxShadow: `0 0 8px ${colors.primary}60`,
                  }}
                />
              )}
              {/* Active scan glow */}
              {isActive && progress < 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${progress * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 40,
                    transform: "translateX(-50%)",
                    background: `radial-gradient(ellipse, ${colors.accent}30 0%, transparent 70%)`,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? colors.accentLight : isComplete ? colors.success : colors.mutedForeground,
                  textTransform: "uppercase" as const,
                  letterSpacing: 2,
                  zIndex: 2,
                }}
              >
                {label}
              </span>
              {isComplete && (
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <CheckCircle size={16} color={colors.success} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ===== INTER-LAYER SPARK PARTICLES ===== */}
      {[0, 1].map((layerIdx) => {
        const sparkStart = layerProcessingStarts[layerIdx] + layerProcessingDurations[layerIdx] - 5;
        const sparkEnd = sparkStart + 15;
        const sparkProgress = interpolate(frame, [sparkStart, sparkEnd], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sparkOpacity = interpolate(frame, [sparkStart, sparkEnd], [0.8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (sparkProgress <= 0 || sparkOpacity <= 0) return null;
        return Array.from({ length: 6 }).map((__, pi) => {
          const offsetX = (pi - 2.5) * 12;
          const offsetY = (pi % 3 - 1) * 8;
          const sx = 960 + 200 + offsetX;
          const sy = layerYPositions[layerIdx];
          const ey = layerYPositions[layerIdx + 1];
          const cx = interpolate(sparkProgress, [0, 1], [sx, 960 - 200 + offsetX]);
          const cy = interpolate(sparkProgress, [0, 1], [sy + offsetY, ey + offsetY]) + Math.sin(sparkProgress * Math.PI) * (-20 + pi * 5);
          return (
            <div
              key={`spark-${layerIdx}-${pi}`}
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: pi % 2 === 0 ? colors.primary : colors.accent,
                boxShadow: `0 0 6px ${pi % 2 === 0 ? colors.primary : colors.accent}`,
                opacity: sparkOpacity,
                zIndex: 15,
              }}
            />
          );
        });
      })}

      {/* ===== BURST PARTICLES FROM LAYER 3 ===== */}
      {burstProgress > 0 && burstOpacity > 0 &&
        Array.from({ length: 15 }).map((_, pi) => {
          const angle = (pi / 15) * Math.PI * 0.6 - Math.PI * 0.3;
          const dist = burstProgress * (120 + (pi % 5) * 30);
          const px = 960 + 240 + Math.cos(angle) * dist;
          const py = layerYPositions[2] + Math.sin(angle) * dist * 0.5;
          return (
            <div
              key={`burst-${pi}`}
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: 3 + (pi % 3),
                height: 3 + (pi % 3),
                borderRadius: "50%",
                background: pi % 2 === 0 ? colors.primary : colors.accent,
                boxShadow: `0 0 6px ${pi % 2 === 0 ? colors.primary : colors.accent}80`,
                opacity: burstOpacity,
                zIndex: 15,
              }}
            />
          );
        })}

      {/* ===== PARTICLE FIELD (converging to Bonjour letters) ===== */}
      {particleProgress > 0 &&
        particleSeeds.map((p, pi) => {
          const targetLetterIdx = pi % bonjourLetters.length;
          const letterWidth = 52;
          const targetX = bonjourBaseX + targetLetterIdx * letterWidth + letterWidth / 2;
          const targetY = 540;

          const drift = interpolate(
            frame,
            [particlePhaseStart, particlePhaseEnd],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const spiralAngle = p.angle + frame * p.speed * 0.05;
          const spiralRadius = (1 - drift) * 60;

          const currentX = interpolate(drift, [0, 1], [p.x, targetX]) + Math.sin(spiralAngle) * spiralRadius;
          const currentY = interpolate(drift, [0, 1], [p.y, targetY]) + Math.cos(spiralAngle) * spiralRadius;

          const letterAppeared = letterSprings[targetLetterIdx] > 0.5;
          const fadeOut = letterAppeared ? interpolate(letterSprings[targetLetterIdx], [0.5, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

          if (fadeOut <= 0.01) return null;

          return (
            <div
              key={`particle-${pi}`}
              style={{
                position: "absolute",
                left: currentX,
                top: currentY,
                width: p.r * 2,
                height: p.r * 2,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 ${p.r * 3}px ${p.color}80`,
                opacity: particleProgress * fadeOut * 0.7,
                zIndex: 12,
              }}
            />
          );
        })}

      {/* ===== BONJOUR LETTERS ===== */}
      {bonjourLetters.map((letter, i) => {
        const s = letterSprings[i];
        if (s < 0.01) return null;
        const scale = letterScales[i];
        const letterWidth = 52;
        const x = bonjourBaseX + i * letterWidth;

        const bloomFlash = interpolate(s, [0, 0.3, 0.7], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const subtlePulse = s > 0.9 ? interpolate(Math.sin((frame - bonjourStartFrame - i * letterSpacing) * 0.12), [-1, 1], [0.3, 0.6]) : 0;

        return (
          <React.Fragment key={`letter-${i}`}>
            {/* Bloom glow */}
            {bloomFlash > 0.01 && (
              <div
                style={{
                  position: "absolute",
                  left: x + letterWidth / 2,
                  top: 540,
                  transform: "translate(-50%, -50%)",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(255,255,255,${bloomFlash * 0.5}) 0%, transparent 70%)`,
                  zIndex: 13,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: x,
                top: 540,
                transform: `translateY(-50%) scale(${scale})`,
                opacity: s,
                fontFamily: montserrat,
                fontSize: 96,
                fontWeight: 900,
                color: colors.white,
                textShadow: `0 0 ${12 + subtlePulse * 20}px rgba(255, 255, 255, ${0.2 + subtlePulse * 0.3}), 0 0 ${30 + subtlePulse * 40}px ${colors.primary}${Math.round(20 + subtlePulse * 30).toString(16).padStart(2, "0")}`,
                zIndex: 14,
                width: letterWidth,
                textAlign: "center" as const,
              }}
            >
              {letter}
            </div>
          </React.Fragment>
        );
      })}

      {/* ===== TRANSLATION COMPLETE BADGE ===== */}
      {badgeSpring > 0.01 && (
        <>
          {/* Pulse ring */}
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 940,
              transform: `translate(-50%, -50%) scale(${badgePulseRingScale})`,
              width: 340,
              height: 64,
              borderRadius: 32,
              border: `2px solid ${colors.success}`,
              opacity: badgePulseRingOpacity,
              zIndex: 29,
            }}
          />
          {/* Badge */}
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 940,
              transform: `translate(-50%, -50%) scale(${badgeScale})`,
              opacity: badgeSpring,
              zIndex: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: 340,
                height: 64,
                borderRadius: 32,
                background: `rgba(34, 197, 94, 0.12)`,
                border: `1.5px solid ${colors.success}`,
                boxShadow: `0 0 24px ${colors.success}30, 0 4px 16px rgba(0,0,0,0.3)`,
              }}
            >
              <CheckCircle size={20} color={colors.success} />
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.success,
                }}
              >
                Translation Complete
              </span>
            </div>
          </div>
        </>
      )}

      {/* ===== SCREEN FLASH ===== */}
      {screenFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: colors.success,
            opacity: screenFlash,
            zIndex: 50,
            pointerEvents: "none" as const,
          }}
        />
      )}

      {/* ===== DECORATIVE ELEMENTS ===== */}
      {/* Arrow from layers to output */}
      {layerActivation[2].isComplete && (
        <div
          style={{
            position: "absolute",
            left: 960 + 240,
            top: layerYPositions[1],
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            opacity: interpolate(
              frame,
              [Math.round(7.3 * fps), Math.round(7.6 * fps)],
              [0, 0.4],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
            zIndex: 6,
          }}
        >
          <div
            style={{
              width: 180,
              height: 1.5,
              background: `linear-gradient(90deg, ${colors.accent}40, ${colors.primary}20)`,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderLeft: `8px solid ${colors.primary}30`,
            }}
          />
        </div>
      )}

      {/* Subtitle labels */}
      <div
        style={{
          position: "absolute",
          left: 320,
          top: 80,
          transform: "translateX(-50%)",
          fontFamily: inter,
          fontSize: 12,
          fontWeight: 600,
          color: colors.mutedForeground,
          textTransform: "uppercase" as const,
          letterSpacing: 3,
          opacity: interpolate(
            frame,
            [Math.round(0.5 * fps), Math.round(1 * fps)],
            [0, 0.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
          zIndex: 3,
        }}
      >
        Input
      </div>
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 300,
          transform: "translateX(-50%)",
          fontFamily: inter,
          fontSize: 12,
          fontWeight: 600,
          color: colors.mutedForeground,
          textTransform: "uppercase" as const,
          letterSpacing: 3,
          opacity: interpolate(
            layerEntranceSprings[0],
            [0, 1],
            [0, 0.5]
          ),
          zIndex: 3,
        }}
      >
        Neural Network
      </div>
      <div
        style={{
          position: "absolute",
          left: bonjourBaseX + (bonjourLetters.length * 52) / 2,
          top: 80,
          transform: "translateX(-50%)",
          fontFamily: inter,
          fontSize: 12,
          fontWeight: 600,
          color: colors.mutedForeground,
          textTransform: "uppercase" as const,
          letterSpacing: 3,
          opacity: interpolate(
            frame,
            [Math.round(7.3 * fps), Math.round(7.8 * fps)],
            [0, 0.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
          zIndex: 3,
        }}
      >
        Output
      </div>
    </AbsoluteFill>
  );
};