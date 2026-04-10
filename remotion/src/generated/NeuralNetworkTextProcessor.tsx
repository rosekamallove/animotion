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
  accent: "#a855f7",
  accentLight: "#c084fc",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  border: "#334155",
  success: "#22c55e",
  destructive: "#ef4444",
  warning: "#f59e0b",
};

export const NeuralNetworkTextProcessor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing in frames
  const helloEntranceStart = 0;
  const tokenizationStart = Math.round(1.5 * fps);
  const tokensToLayersStart = Math.round(3 * fps);
  const layer1ActivationStart = Math.round(4.5 * fps);
  const layer2ActivationStart = Math.round(5.5 * fps);
  const layer3ActivationStart = Math.round(6.5 * fps);
  const bonjourStart = Math.round(7 * fps);
  const badgeStart = Math.round(9 * fps);

  // Hello text entrance
  const helloSpring = spring({ frame, fps, config: { damping: 200 }, delay: helloEntranceStart });
  const helloY = interpolate(helloSpring, [0, 1], [50, 0]);
  const helloOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Hello fade out when tokenization starts
  const helloFadeOut = interpolate(frame, [tokenizationStart, tokenizationStart + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse for hello
  const glowPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.8, 1.3]);
  const glowOpacity = interpolate(frame, [0, 15, tokenizationStart, tokenizationStart + 10], [0, 0.25, 0.25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tokenization - tokens burst out then settle
  const tokens = ["H", "e", "l", "l", "o"];
  const tokenColors = [colors.primary, colors.primaryLight, colors.accent, colors.accentLight, colors.primary];

  const getTokenSpring = (index: number) => {
    const delay = tokenizationStart + index * 3;
    return spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay });
  };

  const getTokenFlySpring = (index: number) => {
    const delay = tokensToLayersStart + index * 4;
    return spring({ frame, fps, config: { damping: 200, stiffness: 80 }, delay });
  };

  // Token positions during tokenization burst phase
  const burstOffsets = [-160, -80, 0, 80, 160];
  const burstYOffsets = [-40, 20, -30, 20, -40];

  // Layer dimensions and positions
  const layerWidth = 500;
  const layerHeight = 90;
  const layerX = 680;
  const layer1Y = 340;
  const layer2Y = 480;
  const layer3Y = 620;
  const layerCenterX = layerX + layerWidth / 2;
  const layerCenterY1 = layer1Y + layerHeight / 2;

  // Layer activation springs
  const layer1Spring = spring({ frame, fps, config: { damping: 200 }, delay: layer1ActivationStart });
  const layer2Spring = spring({ frame, fps, config: { damping: 200 }, delay: layer2ActivationStart });
  const layer3Spring = spring({ frame, fps, config: { damping: 200 }, delay: layer3ActivationStart });

  // Layer glow intensity
  const layer1Glow = interpolate(layer1Spring, [0, 1], [0, 1]);
  const layer2Glow = interpolate(layer2Spring, [0, 1], [0, 1]);
  const layer3Glow = interpolate(layer3Spring, [0, 1], [0, 1]);

  // Shimmer sweep - translateX from -100% to 100% of layer width
  const getShimmerX = (activationStart: number) => {
    const shimmerFrame = frame - activationStart;
    return interpolate(shimmerFrame, [0, 25], [-layerWidth, layerWidth], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Bonjour letters assembly
  const bonjourLetters = ["B", "o", "n", "j", "o", "u", "r"];
  const getBonjourSpring = (index: number) => {
    const delay = bonjourStart + index * 5;
    return spring({ frame, fps, config: { damping: 12, stiffness: 150 }, delay });
  };

  // Badge
  const badgeSpring = spring({ frame, fps, config: { damping: 8, stiffness: 200 }, delay: badgeStart });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);
  const shockwaveProgress = interpolate(frame, [badgeStart, badgeStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particles (simplified streaming particles)
  const numParticles = 24;
  const particleData = Array.from({ length: numParticles }, (_, i) => {
    const seed = i * 137.5;
    const angle = (seed % 360) * (Math.PI / 180);
    const particleRadius = 60 + (seed % 80);
    const delay = layer3ActivationStart + i * 2;
    const particleProgress = interpolate(frame, [delay, delay + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const startX = layerX + layerWidth + 40;
    const startY = layer3Y + layerHeight / 2;
    const endX = 1450 + Math.cos(angle) * 20;
    const endY = 540 + Math.sin(angle) * 80;
    // Use particleRadius to vary end positions slightly
    const endXVaried = endX + Math.cos(angle + Math.PI / 4) * (particleRadius * 0.1);
    return {
      x: interpolate(particleProgress, [0, 1], [startX, endXVaried]),
      y: interpolate(particleProgress, [0, 1], [startY, endY]),
      opacity: interpolate(particleProgress, [0, 0.3, 0.9, 1], [0, 0.9, 0.7, 0]),
      size: 3 + (i % 4),
      color: i % 2 === 0 ? colors.primary : colors.accent,
    };
  });

  // Calculate token position during fly phase
  const getTokenCurrentPos = (index: number) => {
    const burstSpring = getTokenSpring(index);
    const flySpring = getTokenFlySpring(index);

    // During tokenization: burst out from hello position
    const helloX = 280;
    const helloY_pos = 540;
    const burstX = helloX + burstOffsets[index];
    const burstY = helloY_pos + burstYOffsets[index];

    // Target: fly into layer 1 center
    const targetX = layerCenterX - 40;
    const targetY = layerCenterY1;

    const burstPosX = interpolate(burstSpring, [0, 1], [helloX, burstX]);
    const burstPosY = interpolate(burstSpring, [0, 1], [helloY_pos, burstY]);

    const flyX = interpolate(flySpring, [0, 1], [burstPosX, targetX]);
    const flyY = interpolate(flySpring, [0, 1], [burstPosY, targetY]);

    return { x: flyX, y: flyY };
  };

  const tokensVisible = interpolate(
    frame,
    [tokenizationStart - 1, tokenizationStart, layer1ActivationStart + 15, layer1ActivationStart + 25],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050a1a",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          left: "30%",
          top: "20%",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse at center, rgba(0,212,255,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* HELLO TEXT */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 480,
          opacity: helloOpacity * helloFadeOut,
          transform: `translateY(${helloY}px)`,
          fontFamily: inter,
          fontSize: 100,
          fontWeight: 700,
          color: "#ffffff",
          textShadow: `0 0 30px ${colors.primary}, 0 0 60px ${colors.primary}55, 0 0 90px ${colors.primary}33`,
          letterSpacing: "0.05em",
        }}
      >
        Hello
      </div>

      {/* Hello Glow Pulse */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 440,
          width: 360,
          height: 180,
          background: `radial-gradient(ellipse at center, ${colors.primary}33 0%, transparent 70%)`,
          opacity: glowOpacity,
          transform: `scale(${glowPulse})`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* TOKENS */}
      {tokens.map((letter, i) => {
        const pos = getTokenCurrentPos(i);
        const tokenSpring = getTokenSpring(i);
        const tokenScale = interpolate(tokenSpring, [0, 1], [0.3, 1]);

        return (
          <div
            key={`token-${i}`}
            style={{
              position: "absolute",
              left: pos.x - 36,
              top: pos.y - 36,
              width: 72,
              height: 72,
              opacity: tokensVisible,
              transform: `scale(${tokenScale})`,
              background: "rgba(5, 15, 40, 0.95)",
              border: `2px solid ${tokenColors[i]}`,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: inter,
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              boxShadow: `0 0 16px ${tokenColors[i]}88, 0 0 32px ${tokenColors[i]}44`,
            }}
          >
            {letter}
          </div>
        );
      })}

      {/* CONNECTION LINES SVG */}
      {frame >= tokensToLayersStart && frame < layer1ActivationStart + 15 && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {tokens.map((_, i) => {
            const pos = getTokenCurrentPos(i);
            const lineOpacity = interpolate(
              frame,
              [tokensToLayersStart + i * 4, tokensToLayersStart + i * 4 + 10, layer1ActivationStart + 10, layer1ActivationStart + 15],
              [0, 0.5, 0.5, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <line
                key={`line-${i}`}
                x1={280}
                y1={540}
                x2={pos.x}
                y2={pos.y}
                stroke={colors.primary}
                strokeWidth={1.5}
                strokeDasharray="6 4"
                opacity={lineOpacity}
              />
            );
          })}
        </svg>
      )}

      {/* NEURAL NETWORK LAYERS */}
      {/* Layer 1 */}
      <div
        style={{
          position: "absolute",
          left: layerX,
          top: layer1Y,
          width: layerWidth,
          height: layerHeight,
          background: `rgba(13, 27, 62, ${0.8 + layer1Glow * 0.2})`,
          border: `2px solid rgba(59, 130, 246, ${0.4 + layer1Glow * 0.6})`,
          borderRadius: 16,
          boxShadow: layer1Glow > 0.05
            ? `0 0 ${20 + layer1Glow * 40}px rgba(59, 130, 246, ${layer1Glow * 0.8}), inset 0 0 30px rgba(59, 130, 246, ${layer1Glow * 0.3})`
            : "none",
          overflow: "hidden",
        }}
      >
        {/* Shimmer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: getShimmerX(layer1ActivationStart),
            width: 120,
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            opacity: layer1Glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 600,
            color: colors.primary,
            opacity: 0.8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Layer 1
        </div>
        {/* Node dots */}
        {Array.from({ length: 8 }, (_, ni) => {
          const nodeActivation = spring({ frame, fps, config: { damping: 200 }, delay: layer1ActivationStart + ni * 3 });
          return (
            <div
              key={`l1n-${ni}`}
              style={{
                position: "absolute",
                left: 80 + ni * 52,
                top: 8,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors.primary,
                opacity: interpolate(nodeActivation, [0, 1], [0.2, 0.9]),
                transform: `scale(${interpolate(nodeActivation, [0, 1], [0.5, 1.5])})`,
                boxShadow: `0 0 8px ${colors.primary}`,
              }}
            />
          );
        })}
      </div>

      {/* Layer 2 */}
      <div
        style={{
          position: "absolute",
          left: layerX,
          top: layer2Y,
          width: layerWidth,
          height: layerHeight,
          background: `rgba(13, 27, 62, ${0.8 + layer2Glow * 0.2})`,
          border: `2px solid rgba(124, 58, 237, ${0.4 + layer2Glow * 0.6})`,
          borderRadius: 16,
          boxShadow: layer2Glow > 0.05
            ? `0 0 ${20 + layer2Glow * 40}px rgba(124, 58, 237, ${layer2Glow * 0.8}), inset 0 0 30px rgba(124, 58, 237, ${layer2Glow * 0.3})`
            : "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: getShimmerX(layer2ActivationStart),
            width: 120,
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent)",
            opacity: layer2Glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 600,
            color: colors.accentLight,
            opacity: 0.8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Layer 2
        </div>
        {Array.from({ length: 8 }, (_, ni) => {
          const nodeActivation = spring({ frame, fps, config: { damping: 200 }, delay: layer2ActivationStart + ni * 3 });
          return (
            <div
              key={`l2n-${ni}`}
              style={{
                position: "absolute",
                left: 80 + ni * 52,
                top: 8,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors.accent,
                opacity: interpolate(nodeActivation, [0, 1], [0.2, 0.9]),
                transform: `scale(${interpolate(nodeActivation, [0, 1], [0.5, 1.5])})`,
                boxShadow: `0 0 8px ${colors.accent}`,
              }}
            />
          );
        })}
      </div>

      {/* Layer 3 */}
      <div
        style={{
          position: "absolute",
          left: layerX,
          top: layer3Y,
          width: layerWidth,
          height: layerHeight,
          background: `rgba(13, 27, 62, ${0.8 + layer3Glow * 0.2})`,
          border: `2px solid rgba(168, 85, 247, ${0.4 + layer3Glow * 0.6})`,
          borderRadius: 16,
          boxShadow: layer3Glow > 0.05
            ? `0 0 ${20 + layer3Glow * 50}px rgba(168, 85, 247, ${layer3Glow * 0.7}), 0 0 ${layer3Glow * 30}px rgba(0, 212, 255, ${layer3Glow * 0.5}), inset 0 0 30px rgba(168, 85, 247, ${layer3Glow * 0.3})`
            : "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: getShimmerX(layer3ActivationStart),
            width: 140,
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            opacity: layer3Glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 600,
            color: colors.accentLight,
            opacity: 0.8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Layer 3
        </div>
        {Array.from({ length: 8 }, (_, ni) => {
          const nodeActivation = spring({ frame, fps, config: { damping: 200 }, delay: layer3ActivationStart + ni * 3 });
          const nodeColor = ni % 2 === 0 ? colors.primary : colors.accent;
          return (
            <div
              key={`l3n-${ni}`}
              style={{
                position: "absolute",
                left: 80 + ni * 52,
                top: 8,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: nodeColor,
                opacity: interpolate(nodeActivation, [0, 1], [0.2, 0.9]),
                transform: `scale(${interpolate(nodeActivation, [0, 1], [0.5, 1.6])})`,
                boxShadow: `0 0 8px ${nodeColor}`,
              }}
            />
          );
        })}
      </div>

      {/* LAYER CONNECTOR ARROWS */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {/* Layer 1 to Layer 2 */}
        <line
          x1={layerCenterX}
          y1={layer1Y + layerHeight}
          x2={layerCenterX}
          y2={layer2Y}
          stroke={colors.primary}
          strokeWidth={2}
          opacity={interpolate(layer1Glow + layer2Glow, [0, 1], [0, 0.5])}
          strokeDasharray="6 4"
        />
        {/* Layer 2 to Layer 3 */}
        <line
          x1={layerCenterX}
          y1={layer2Y + layerHeight}
          x2={layerCenterX}
          y2={layer3Y}
          stroke={colors.accent}
          strokeWidth={2}
          opacity={interpolate(layer2Glow + layer3Glow, [0, 1], [0, 0.5])}
          strokeDasharray="6 4"
        />
      </svg>

      {/* PARTICLES */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {particleData.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
            style={{ filter: `blur(0.5px)` }}
          />
        ))}
      </svg>

      {/* BONJOUR LETTERS */}
      <div
        style={{
          position: "absolute",
          left: 1280,
          top: 470,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
        }}
      >
        {bonjourLetters.map((letter, i) => {
          const letterSpring = getBonjourSpring(i);
          const letterScale = interpolate(letterSpring, [0, 1], [0, 1]);
          const letterOpacity = interpolate(letterSpring, [0, 0.3, 1], [0, 1, 1]);
          const flashProgress = spring({ frame, fps, config: { damping: 200 }, delay: bonjourStart + i * 5 });
          const brightness = interpolate(flashProgress, [0, 0.3, 1], [3, 1.5, 1]);

          return (
            <div
              key={`bj-${i}`}
              style={{
                opacity: letterOpacity,
                transform: `scale(${letterScale})`,
                fontFamily: montserrat,
                fontSize: 96,
                fontWeight: 900,
                color: "#ffffff",
                textShadow: `0 0 20px ${colors.accent}, 0 0 40px ${colors.accent}88, 0 0 60px ${colors.primary}44`,
                filter: `brightness(${brightness})`,
                lineHeight: 1,
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      {/* Bonjour label */}
      {getBonjourSpring(6) > 0.5 && (
        <div
          style={{
            position: "absolute",
            left: 1280,
            top: 590,
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 500,
            color: colors.accentLight,
            opacity: interpolate(getBonjourSpring(6), [0.5, 1], [0, 0.7]),
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          French Output
        </div>
      )}

      {/* TRANSLATION COMPLETE BADGE */}
      {frame >= badgeStart && (
        <>
          {/* Shockwave */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 920,
              transform: `translateX(-50%) scale(${interpolate(shockwaveProgress, [0, 1], [1, 2.5])})`,
              width: 520,
              height: 80,
              border: `2px solid ${colors.primary}`,
              borderRadius: 40,
              opacity: interpolate(shockwaveProgress, [0, 0.2, 1], [0, 0.8, 0]),
              pointerEvents: "none",
            }}
          />

          {/* Badge */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 920,
              transform: `translateX(-50%) scale(${badgeScale})`,
              width: 500,
              height: 76,
              background: "rgba(5, 10, 26, 0.95)",
              border: `2px solid ${colors.primary}`,
              borderRadius: 38,
              boxShadow: `0 0 30px ${colors.primary}88, 0 0 60px ${colors.primary}44, inset 0 0 20px rgba(0, 212, 255, 0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: badgeScale > 0.01 ? 1 : 0,
            }}
          >
            <div
              style={{
                color: colors.primary,
                display: "flex",
                alignItems: "center",
                filter: `drop-shadow(0 0 8px ${colors.primary})`,
              }}
            >
              <CheckCircle size={32} strokeWidth={2.5} />
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 26,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.06em",
                textShadow: `0 0 20px ${colors.primary}66`,
              }}
            >
              Translation Complete
            </div>
          </div>
        </>
      )}

      {/* INPUT label */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 420,
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 500,
          color: colors.mutedForeground,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: interpolate(frame, [0, 15], [0, 0.7], { extrapolateRight: "clamp" }),
        }}
      >
        Input
      </div>

      {/* OUTPUT label */}
      <div
        style={{
          position: "absolute",
          left: 1280,
          top: 420,
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 500,
          color: colors.mutedForeground,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: interpolate(frame, [bonjourStart, bonjourStart + 15], [0, 0.7], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Output
      </div>

      {/* NEURAL NETWORK label */}
      <div
        style={{
          position: "absolute",
          left: layerX,
          top: layer1Y - 50,
          width: layerWidth,
          textAlign: "center",
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 500,
          color: colors.mutedForeground,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: interpolate(layer1Spring, [0, 1], [0, 0.7]),
        }}
      >
        Neural Network
      </div>
    </AbsoluteFill>
  );
};