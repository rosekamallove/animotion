import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { DollarSign } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#fdf4ff", foreground: "#1e1b4b", primary: "#ec4899",
  primaryLight: "#f472b6", primaryDark: "#db2777", accent: "#f97316",
  accentLight: "#fb923c", muted: "#fce7f3", mutedForeground: "#6b7280",
  border: "#fbcfe8", success: "#14b8a6", destructive: "#ef4444",
  warning: "#f59e0b", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)", border: "3px solid rgba(236, 72, 153, 0.15)",
  borderRadius: 24, boxShadow: "0 4px 20px rgba(236, 72, 153, 0.08)",
};

const stageColors = {
  awareness: "#3b82f6",
  consideration: "#f97316",
  conversion: "#14b8a6",
};

const seedRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

export const MarketingFunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const funnelCenterX = 750;
  const funnelTop = 160;
  const funnelBottom = 780;
  const funnelTopWidth = 600;
  const funnelBottomWidth = 100;
  const bandHeight = (funnelBottom - funnelTop) / 3;

  const getLeftEdge = (y: number) => {
    const t = (y - funnelTop) / (funnelBottom - funnelTop);
    const tc = Math.max(0, Math.min(1, t));
    const halfWidth = interpolate(tc, [0, 1], [funnelTopWidth / 2, funnelBottomWidth / 2]);
    return funnelCenterX - halfWidth;
  };
  const getRightEdge = (y: number) => {
    const t = (y - funnelTop) / (funnelBottom - funnelTop);
    const tc = Math.max(0, Math.min(1, t));
    const halfWidth = interpolate(tc, [0, 1], [funnelTopWidth / 2, funnelBottomWidth / 2]);
    return funnelCenterX + halfWidth;
  };

  const titleSpring = spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay: Math.round(0.2 * fps) });
  const titleY = interpolate(titleSpring, [0, 1], [-60, 0]);
  const underlineWidth = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 80 }, delay: Math.round(0.6 * fps) }),
    [0, 1], [0, 360]
  );

  const funnelDraw = interpolate(frame, [Math.round(0.5 * fps), Math.round(2.5 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const awarenessFill = interpolate(frame, [Math.round(1.5 * fps), Math.round(2.2 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const considerationFill = interpolate(frame, [Math.round(1.8 * fps), Math.round(2.5 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const conversionFill = interpolate(frame, [Math.round(2.1 * fps), Math.round(2.8 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelASpring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(2.0 * fps) });
  const labelCSpring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(2.3 * fps) });
  const labelVSpring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(2.6 * fps) });

  const counter10kStart = Math.round(3.2 * fps);
  const counter10kEnd = Math.round(4.7 * fps);
  const counter10kVal = Math.round(interpolate(frame, [counter10kStart, counter10kEnd], [0, 10000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const badge10kSpring = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, delay: Math.round(3.0 * fps) });

  const dotCount = 60;
  const dotStartFrame = Math.round(3.0 * fps);

  const counter3200Start = Math.round(7.5 * fps);
  const counter3200End = Math.round(8.8 * fps);
  const counter3200Val = Math.round(interpolate(frame, [counter3200Start, counter3200End], [10000, 3200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const badge3200Spring = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, delay: Math.round(7.2 * fps) });
  const shake3200Frame = Math.round(8.8 * fps);
  const shake3200 = frame >= shake3200Frame && frame < shake3200Frame + 15 ? Math.sin((frame - shake3200Frame) * 1.2) * 6 * Math.max(0, 1 - (frame - shake3200Frame) / 15) : 0;

  const counter840Start = Math.round(11.5 * fps);
  const counter840End = Math.round(12.8 * fps);
  const counter840Val = Math.round(interpolate(frame, [counter840Start, counter840End], [3200, 840], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const badge840Spring = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, delay: Math.round(11.2 * fps) });
  const shake840Frame = Math.round(12.8 * fps);
  const shake840 = frame >= shake840Frame && frame < shake840Frame + 15 ? Math.sin((frame - shake840Frame) * 1.2) * 6 * Math.max(0, 1 - (frame - shake840Frame) / 15) : 0;

  const counter127Start = Math.round(15.5 * fps);
  const counter127End = Math.round(16.8 * fps);
  const counter127Val = Math.round(interpolate(frame, [counter127Start, counter127End], [840, 127], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const badge127Spring = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, delay: Math.round(15.2 * fps) });
  const shake127Frame = Math.round(16.8 * fps);
  const shake127 = frame >= shake127Frame && frame < shake127Frame + 15 ? Math.sin((frame - shake127Frame) * 1.2) * 6 * Math.max(0, 1 - (frame - shake127Frame) / 15) : 0;

  const dropoff1Start = Math.round(7.5 * fps);
  const dropoff2Start = Math.round(11.5 * fps);
  const dropoff3Start = Math.round(15.5 * fps);

  const pill68Spring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(9.0 * fps) });
  const pill74Spring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(13.0 * fps) });
  const pill85Spring = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, delay: Math.round(17.0 * fps) });

  const dollarConvergeStart = Math.round(19.0 * fps);
  const dollarPopDelay = Math.round(21.0 * fps);
  const dollarSpring = spring({ frame, fps, config: { damping: 8, stiffness: 150, mass: 1.2 }, delay: dollarPopDelay });
  const dollarScale = interpolate(dollarSpring, [0, 1], [0, 1]);
  const rippleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 60 }, delay: Math.round(21.5 * fps) });
  const rippleScale = interpolate(rippleSpring, [0, 1], [1, 2.5]);
  const rippleOpacity = interpolate(rippleSpring, [0, 1], [0.8, 0]);
  const dollarPulse = frame > Math.round(23 * fps) ? 1 + Math.sin(frame * 0.08) * 0.04 : 1;

  const convCardSpring = spring({ frame, fps, config: { damping: 8, stiffness: 150 }, delay: Math.round(23.5 * fps) });
  const convCardScale = interpolate(convCardSpring, [0, 1], [0.2, 1]);

  const arrowDraw = interpolate(frame, [Math.round(24.5 * fps), Math.round(25.5 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const trendTextSpring = spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay: Math.round(25.8 * fps) });

  const funnelPoints = (() => {
    const tl = { x: funnelCenterX - funnelTopWidth / 2, y: funnelTop };
    const tr = { x: funnelCenterX + funnelTopWidth / 2, y: funnelTop };
    const br = { x: funnelCenterX + funnelBottomWidth / 2, y: funnelBottom };
    const bl = { x: funnelCenterX - funnelBottomWidth / 2, y: funnelBottom };
    return `${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`;
  })();

  const renderDropOffDots = (startFrame: number, count: number, yCenter: number) => {
    if (frame < startFrame) return null;
    const dots = [];
    for (let i = 0; i < count; i++) {
      const seed = startFrame * 100 + i;
      const side = i % 2 === 0 ? -1 : 1;
      const delay = startFrame + Math.floor(i * 1.5);
      const elapsed = Math.max(0, frame - delay);
      const duration = 40;
      const progress = Math.min(1, elapsed / duration);
      const startX = side > 0 ? getRightEdge(yCenter) : getLeftEdge(yCenter);
      const endX = startX + side * (200 + seedRandom(seed) * 300);
      const endY = yCenter + 80 + seedRandom(seed + 1) * 150;
      const x = interpolate(progress, [0, 1], [startX, endX]);
      const arcY = yCenter + progress * (endY - yCenter) - Math.sin(progress * Math.PI) * (40 + seedRandom(seed + 2) * 60);
      const opacity = interpolate(progress, [0, 0.6, 1], [1, 0.7, 0], { extrapolateRight: "clamp" });
      if (opacity <= 0) continue;
      dots.push(
        <circle key={`drop-${startFrame}-${i}`} cx={x} cy={arcY} r={4} fill={colors.mutedForeground} opacity={opacity} />
      );
    }
    return dots;
  };

  const renderFunnelDots = () => {
    const dots = [];
    for (let i = 0; i < dotCount; i++) {
      const seed = i * 7 + 42;
      const waveIndex = Math.floor(i / 10);
      const dotDelay = dotStartFrame + waveIndex * 6 + (i % 10) * 2;
      const elapsed = frame - dotDelay;
      if (elapsed < 0) continue;

      const startY = funnelTop - 40;
      const xOffset = (seedRandom(seed) - 0.5) * 0.8;

      const restY1 = funnelTop + bandHeight * 0.5;

      const dropPhase1 = Math.round(7.0 * fps);
      const restY2 = funnelTop + bandHeight * 1.5;

      const dropPhase2 = Math.round(11.0 * fps);
      const restY3 = funnelTop + bandHeight * 2.5;
      const restX3 = funnelCenterX + xOffset * 0.3 * (getRightEdge(restY3) - getLeftEdge(restY3));

      const survivalThreshold1 = 0.32;
      const survivalThreshold2 = 0.084;
      const survivalThreshold3 = 0.0127;
      const dotSurvivalSeed = seedRandom(seed + 999);

      let dotX: number;
      let dotY: number;
      let dotOpacity = 1;
      let dotRadius = 5;

      if (frame < dropPhase1) {
        const entryProgress = Math.min(1, elapsed / 20);
        dotY = interpolate(entryProgress, [0, 1], [startY, restY1]);
        const leftE = getLeftEdge(dotY);
        const rightE = getRightEdge(dotY);
        dotX = funnelCenterX + xOffset * (rightE - leftE) * 0.45;
      } else if (frame < dropPhase2) {
        if (dotSurvivalSeed > survivalThreshold1) {
          dotOpacity = 0;
          dotX = 0;
          dotY = 0;
        } else {
          const moveProgress = Math.min(1, (frame - dropPhase1) / 30);
          dotY = interpolate(moveProgress, [0, 1], [restY1, restY2]);
          const leftE = getLeftEdge(dotY);
          const rightE = getRightEdge(dotY);
          dotX = funnelCenterX + xOffset * 0.6 * (rightE - leftE) * 0.45;
        }
      } else if (frame < Math.round(15.0 * fps)) {
        if (dotSurvivalSeed > survivalThreshold2) {
          dotOpacity = 0;
          dotX = 0;
          dotY = 0;
        } else {
          const moveProgress = Math.min(1, (frame - dropPhase2) / 30);
          dotY = interpolate(moveProgress, [0, 1], [restY2, restY3]);
          const leftE = getLeftEdge(dotY);
          const rightE = getRightEdge(dotY);
          dotX = funnelCenterX + xOffset * 0.3 * (rightE - leftE) * 0.45;
        }
      } else if (frame < dollarConvergeStart) {
        if (dotSurvivalSeed > survivalThreshold3) {
          dotOpacity = 0;
          dotX = 0;
          dotY = 0;
        } else {
          dotY = restY3;
          const leftE = getLeftEdge(dotY);
          const rightE = getRightEdge(dotY);
          dotX = funnelCenterX + xOffset * 0.3 * (rightE - leftE) * 0.45;
        }
      } else {
        if (dotSurvivalSeed > survivalThreshold3) {
          dotOpacity = 0;
          dotX = 0;
          dotY = 0;
        } else {
          const convergeProgress = Math.min(1, (frame - dollarConvergeStart) / 40);
          const targetX = funnelCenterX;
          const targetY = funnelBottom + 80;
          dotX = interpolate(convergeProgress, [0, 1], [restX3, targetX + Math.cos(i * 0.8) * (1 - convergeProgress) * 40]);
          dotY = interpolate(convergeProgress, [0, 1], [restY3, targetY + Math.sin(i * 0.8) * (1 - convergeProgress) * 40]);
          dotRadius = interpolate(convergeProgress, [0, 0.8, 1], [5, 4, 0], { extrapolateRight: "clamp" });
          dotOpacity = interpolate(convergeProgress, [0.7, 1], [1, 0], { extrapolateRight: "clamp" });
        }
      }

      if (dotOpacity <= 0 || dotRadius <= 0) continue;

      dots.push(
        <circle
          key={`dot-${i}`}
          cx={dotX}
          cy={dotY}
          r={dotRadius}
          fill={colors.white}
          stroke={colors.foreground}
          strokeWidth={1.5}
          opacity={dotOpacity}
        />
      );
    }
    return dots;
  };

  const renderCounterBadge = (
    value: number,
    label: string,
    color: string,
    badgeSpring: number,
    shake: number,
    yPosition: number
  ) => {
    const scale = interpolate(badgeSpring, [0, 1], [0.3, 1]);
    const rotation = interpolate(badgeSpring, [0, 1], [-8, 0]);
    return (
      <div style={{
        position: "absolute",
        right: 100,
        top: yPosition,
        opacity: badgeSpring,
        transform: `scale(${scale}) rotate(${rotation}deg) translateX(${shake}px)`,
        ...glass,
        padding: "16px 28px",
        borderTop: `4px solid ${color}`,
        textAlign: "center",
        minWidth: 140,
        zIndex: 10,
      }}>
        <div style={{ fontFamily: montserrat, fontSize: 36, fontWeight: 900, color, lineHeight: 1.1 }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.mutedForeground, marginTop: 4 }}>
          {label}
        </div>
      </div>
    );
  };

  const renderDropoffPill = (text: string, pillSpring: number, yPosition: number, side: number) => {
    const scale = interpolate(pillSpring, [0, 1], [0.3, 1]);
    const rot = interpolate(pillSpring, [0, 1], [-10, 0]);
    return (
      <div style={{
        position: "absolute",
        left: side < 0 ? 80 : undefined,
        right: side > 0 ? 280 : undefined,
        top: yPosition,
        opacity: pillSpring,
        transform: `scale(${scale}) rotate(${rot}deg)`,
        background: colors.white,
        border: `3px solid ${colors.destructive}`,
        borderRadius: 20,
        padding: "6px 16px",
        zIndex: 10,
      }}>
        <span style={{ fontFamily: montserrat, fontSize: 18, fontWeight: 700, color: colors.destructive }}>{text}</span>
      </div>
    );
  };

  const dollarCenterX = funnelCenterX;
  const dollarCenterY = funnelBottom + 80;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      {/* Title */}
      <div style={{
        position: "absolute",
        top: 30,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
        opacity: titleSpring,
        transform: `translateY(${titleY}px)`,
      }}>
        <div style={{ fontFamily: montserrat, fontSize: 52, fontWeight: 900, color: colors.foreground, letterSpacing: 2 }}>
          MARKETING FUNNEL
        </div>
        <div style={{
          width: underlineWidth,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.primary,
          marginTop: 8,
        }} />
      </div>

      {/* Funnel SVG */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <clipPath id="funnelClip">
            <polygon points={funnelPoints} />
          </clipPath>
        </defs>

        {/* Funnel color bands */}
        <g clipPath="url(#funnelClip)">
          {/* Awareness band - blue */}
          <rect
            x={funnelCenterX - funnelTopWidth / 2}
            y={funnelTop}
            width={funnelTopWidth * awarenessFill}
            height={bandHeight}
            fill={`${stageColors.awareness}20`}
          />
          {/* Consideration band - orange */}
          <rect
            x={funnelCenterX - funnelTopWidth / 2}
            y={funnelTop + bandHeight}
            width={funnelTopWidth * considerationFill}
            height={bandHeight}
            fill={`${stageColors.consideration}20`}
          />
          {/* Conversion band - teal */}
          <rect
            x={funnelCenterX - funnelTopWidth / 2}
            y={funnelTop + bandHeight * 2}
            width={funnelTopWidth * conversionFill}
            height={bandHeight}
            fill={`${stageColors.conversion}20`}
          />
        </g>

        {/* Funnel outline */}
        <polygon
          points={funnelPoints}
          fill="none"
          stroke={colors.foreground}
          strokeWidth={4}
          strokeDasharray={2400}
          strokeDashoffset={interpolate(funnelDraw, [0, 1], [2400, 0])}
          strokeLinejoin="round"
        />

        {/* Stage divider lines */}
        {funnelDraw > 0.8 && (
          <>
            <line
              x1={getLeftEdge(funnelTop + bandHeight)}
              y1={funnelTop + bandHeight}
              x2={getRightEdge(funnelTop + bandHeight)}
              y2={funnelTop + bandHeight}
              stroke={colors.foreground}
              strokeWidth={2}
              strokeDasharray="8 4"
              opacity={0.3}
            />
            <line
              x1={getLeftEdge(funnelTop + bandHeight * 2)}
              y1={funnelTop + bandHeight * 2}
              x2={getRightEdge(funnelTop + bandHeight * 2)}
              y2={funnelTop + bandHeight * 2}
              stroke={colors.foreground}
              strokeWidth={2}
              strokeDasharray="8 4"
              opacity={0.3}
            />
          </>
        )}

        {/* Dots inside funnel */}
        {renderFunnelDots()}

        {/* Drop-off dots */}
        {renderDropOffDots(dropoff1Start, 22, funnelTop + bandHeight)}
        {renderDropOffDots(dropoff2Start, 14, funnelTop + bandHeight * 2)}
        {renderDropOffDots(dropoff3Start, 8, funnelBottom)}

        {/* Dollar sign ripple */}
        {dollarSpring > 0 && (
          <circle
            cx={dollarCenterX}
            cy={dollarCenterY}
            r={40}
            fill="none"
            stroke={stageColors.conversion}
            strokeWidth={3}
            opacity={rippleOpacity}
            transform={`translate(${dollarCenterX * (1 - rippleScale)}, ${dollarCenterY * (1 - rippleScale)}) scale(${rippleScale})`}
          />
        )}
      </svg>

      {/* Stage labels */}
      <div style={{
        position: "absolute",
        left: getLeftEdge(funnelTop + bandHeight * 0.5) - 180,
        top: funnelTop + bandHeight * 0.5 - 18,
        opacity: labelASpring,
        transform: `translateX(${interpolate(labelASpring, [0, 1], [-40, 0])}px) scale(${interpolate(labelASpring, [0, 1], [0.5, 1])})`,
        zIndex: 10,
      }}>
        <div style={{
          background: stageColors.awareness,
          borderRadius: 20,
          padding: "8px 20px",
          boxShadow: `0 4px 16px ${stageColors.awareness}40`,
        }}>
          <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.white, letterSpacing: 2 }}>AWARENESS</span>
        </div>
      </div>

      <div style={{
        position: "absolute",
        left: getLeftEdge(funnelTop + bandHeight * 1.5) - 200,
        top: funnelTop + bandHeight * 1.5 - 18,
        opacity: labelCSpring,
        transform: `translateX(${interpolate(labelCSpring, [0, 1], [-40, 0])}px) scale(${interpolate(labelCSpring, [0, 1], [0.5, 1])})`,
        zIndex: 10,
      }}>
        <div style={{
          background: stageColors.consideration,
          borderRadius: 20,
          padding: "8px 20px",
          boxShadow: `0 4px 16px ${stageColors.consideration}40`,
        }}>
          <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.white, letterSpacing: 2 }}>CONSIDERATION</span>
        </div>
      </div>

      <div style={{
        position: "absolute",
        left: getLeftEdge(funnelTop + bandHeight * 2.5) - 170,
        top: funnelTop + bandHeight * 2.5 - 18,
        opacity: labelVSpring,
        transform: `translateX(${interpolate(labelVSpring, [0, 1], [-40, 0])}px) scale(${interpolate(labelVSpring, [0, 1], [0.5, 1])})`,
        zIndex: 10,
      }}>
        <div style={{
          background: stageColors.conversion,
          borderRadius: 20,
          padding: "8px 20px",
          boxShadow: `0 4px 16px ${stageColors.conversion}40`,
        }}>
          <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.white, letterSpacing: 2 }}>CONVERSION</span>
        </div>
      </div>

      {/* Counter badges */}
      {renderCounterBadge(counter10kVal, "Visitors", colors.primary, badge10kSpring, 0, funnelTop + 20)}
      {renderCounterBadge(counter3200Val, "Aware", stageColors.awareness, badge3200Spring, shake3200, funnelTop + bandHeight + 20)}
      {renderCounterBadge(counter840Val, "Considering", stageColors.consideration, badge840Spring, shake840, funnelTop + bandHeight * 2 + 20)}
      {renderCounterBadge(counter127Val, "Converted", stageColors.conversion, badge127Spring, shake127, funnelTop + bandHeight * 2 + bandHeight / 2 + 40)}

      {/* Drop-off percentage pills */}
      {renderDropoffPill("-68%", pill68Spring, funnelTop + bandHeight - 12, -1)}
      {renderDropoffPill("-74%", pill74Spring, funnelTop + bandHeight * 2 - 12, -1)}
      {renderDropoffPill("-85%", pill85Spring, funnelBottom - 12, -1)}

      {/* Dollar sign */}
      {dollarSpring > 0 && (
        <div style={{
          position: "absolute",
          left: dollarCenterX - 55,
          top: dollarCenterY - 55,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: `${stageColors.conversion}15`,
          border: `4px solid ${stageColors.conversion}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${dollarScale * dollarPulse})`,
          opacity: dollarSpring,
          boxShadow: `0 0 ${30 * dollarPulse}px ${stageColors.conversion}40`,
          zIndex: 15,
        }}>
          <DollarSign size={60} color={stageColors.conversion} strokeWidth={3} />
        </div>
      )}

      {/* Conversion rate card */}
      {convCardSpring > 0 && (
        <div style={{
          position: "absolute",
          right: 120,
          bottom: 100,
          opacity: convCardSpring,
          transform: `scale(${convCardScale})`,
          zIndex: 20,
          ...glass,
          padding: "28px 40px",
          borderLeft: `6px solid ${colors.primary}`,
          boxShadow: `0 8px 40px ${colors.primary}20`,
        }}>
          <div style={{ fontFamily: montserrat, fontSize: 64, fontWeight: 900, color: colors.primary, lineHeight: 1 }}>
            2.4%
          </div>
          <div style={{ fontFamily: inter, fontSize: 18, fontWeight: 600, color: colors.mutedForeground, marginTop: 8 }}>
            Conversion Rate
          </div>

          {/* Trend arrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <svg width={50} height={30} viewBox="0 0 50 30" style={{ overflow: "visible" }}>
              <polyline
                points="5,25 20,12 35,18 48,5"
                fill="none"
                stroke={stageColors.conversion}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={80}
                strokeDashoffset={interpolate(arrowDraw, [0, 1], [80, 0])}
              />
              {arrowDraw > 0.8 && (
                <>
                  <line x1={44} y1={3} x2={48} y2={5} stroke={stageColors.conversion} strokeWidth={4} strokeLinecap="round" opacity={interpolate(arrowDraw, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
                  <line x1={48} y1={5} x2={48} y2={12} stroke={stageColors.conversion} strokeWidth={4} strokeLinecap="round" opacity={interpolate(arrowDraw, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
                </>
              )}
            </svg>
            <span style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 600,
              color: stageColors.conversion,
              opacity: trendTextSpring,
              transform: `translateX(${interpolate(trendTextSpring, [0, 1], [10, 0])}px)`,
            }}>
              Up vs last month
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};