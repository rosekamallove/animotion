import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const ImpactCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.3, 1]);
  const cardY = interpolate(cardSpring, [0, 1], [120, 0]);
  return (
    <div
      style={{
        opacity: cardSpring,
        transform: `scale(${cardScale}) translateY(${cardY}px)`,
      }}
    >
      {children}
    </div>
  );
};

const ScaleCardContent: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  const countProgress = interpolate(frame, [5, 35], [128000, 500000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayNumber = Math.round(countProgress).toLocaleString();
  const isComplete = frame >= 35;

  const numberGlow = isComplete
    ? `0 0 20px ${tqColors.primary}60, 0 0 40px ${tqColors.primary}30`
    : "none";

  const cardStyle: React.CSSProperties = {
    ...tqGlass,
    width: 350,
    height: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    borderLeft: `4px solid ${tqColors.primary}`,
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 48,
          fontWeight: 900,
          color: isComplete ? tqColors.primary : tqColors.foreground,
          lineHeight: 1,
          marginBottom: 24,
          textShadow: numberGlow,
        }}
      >
        {displayNumber}
        {isComplete ? "+" : ""}
      </div>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 22,
          fontWeight: 700,
          color: tqColors.foreground,
          marginBottom: 8,
        }}
      >
        Context Window
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 400,
          color: tqColors.mutedForeground,
          textAlign: "center",
        }}
      >
        Same hardware, 4x the memory
      </div>
    </div>
  );
};

const SpeedCardContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0.3, 1]);

  const cardStyle: React.CSSProperties = {
    ...tqGlass,
    width: 350,
    height: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    borderLeft: `4px solid ${tqColors.accent}`,
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 96,
          fontWeight: 900,
          color: tqColors.accent,
          lineHeight: 1,
          marginBottom: 24,
          textShadow: `0 0 24px ${tqColors.accent}60`,
          transform: `scale(${numScale})`,
        }}
      >
        8x
      </div>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 22,
          fontWeight: 700,
          color: tqColors.foreground,
          marginBottom: 8,
        }}
      >
        Faster Inference
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 400,
          color: tqColors.mutedForeground,
          textAlign: "center",
        }}
      >
        Less data to move = faster responses
      </div>
    </div>
  );
};

const VibeCodingCardContent: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    ...tqGlass,
    width: 350,
    height: 340,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    borderLeft: `4px solid ${tqColors.success}`,
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 80,
          fontWeight: 900,
          color: tqColors.success,
          lineHeight: 1,
          marginBottom: 24,
          textShadow: `0 0 20px ${tqColors.success}50, 0 0 40px ${tqColors.success}20`,
        }}
      >
        {"{ }"}
      </div>
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 22,
          fontWeight: 700,
          color: tqColors.foreground,
          marginBottom: 8,
        }}
      >
        Full Codebase Context
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 400,
          color: tqColors.mutedForeground,
          textAlign: "center",
        }}
      >
        PRDs, schemas, edge cases — all at once
      </div>
    </div>
  );
};

export const RealWorldImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 0,
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);

  // Bottom banner
  const bannerSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(4.5 * fps),
  });
  const bannerY = interpolate(bannerSpring, [0, 1], [20, 0]);

  const cardsFrom = Math.round(1.0 * fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tqColors.background,
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, ...gridBackground }} />

      {/* Background accents */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.primary}0a 0%, transparent 70%)`,
          top: -200,
          left: "30%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tqColors.accent}08 0%, transparent 70%)`,
          bottom: -100,
          right: -50,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontFamily: montserrat,
          fontSize: 64,
          fontWeight: 900,
          color: tqColors.foreground,
          opacity: titleSpring,
          transform: `translateY(${titleY}px)`,
          marginTop: 80,
          zIndex: 1,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Why This Actually{" "}
        <span style={{ color: tqColors.primary }}>Matters</span>
      </div>

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          zIndex: 1,
          marginTop: 80,
        }}
      >
        <Sequence from={cardsFrom} layout="none">
          <ImpactCard>
            <ScaleCardContent />
          </ImpactCard>
        </Sequence>
        <Sequence from={cardsFrom + 15} layout="none">
          <ImpactCard>
            <SpeedCardContent />
          </ImpactCard>
        </Sequence>
        <Sequence from={cardsFrom + 30} layout="none">
          <ImpactCard>
            <VibeCodingCardContent />
          </ImpactCard>
        </Sequence>
      </div>

      {/* Bottom banner */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 28,
          fontWeight: 600,
          color: tqColors.primary,
          opacity: bannerSpring,
          transform: `translateY(${bannerY}px)`,
          marginTop: 80,
          zIndex: 1,
          textShadow: `0 0 16px ${tqColors.primary}40`,
        }}
      >
        The biggest bottleneck in AI, solved.
      </div>
    </AbsoluteFill>
  );
};
