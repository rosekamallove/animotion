import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const BoldStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = spring({ frame, fps, config: { damping: 200 }, delay: 0 });
  const numberPop = spring({ frame, fps, config: { damping: 10, stiffness: 120 }, delay: Math.round(0.5 * fps) });
  const line2 = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.0 * fps) });
  const payNothing = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.0 * fps) });

  const numberScale = interpolate(numberPop, [0, 1], [0.3, 1]);
  const numberRotate = interpolate(numberPop, [0, 1], [-10, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background accent circles */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 70%)`,
          top: -100,
          right: -100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}06 0%, transparent 70%)`,
          bottom: -50,
          left: -50,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        {/* Line 1 */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 500,
            color: colors.mutedForeground,
            opacity: line1,
            transform: `translateY(${interpolate(line1, [0, 1], [20, 0])}px)`,
            marginBottom: 16,
          }}
        >
          The world's first AI Agent that guarantees
        </div>

        {/* Big number */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 200,
            fontWeight: 900,
            color: colors.primary,
            lineHeight: 1,
            transform: `scale(${numberScale}) rotate(${numberRotate}deg)`,
            opacity: numberPop,
            textShadow: `0 8px 40px ${colors.primary}30`,
          }}
        >
          65%
        </div>

        {/* Line 2 */}
        <div
          style={{
            fontFamily: montserrat,
            fontSize: 36,
            fontWeight: 700,
            color: colors.foreground,
            opacity: line2,
            transform: `translateY(${interpolate(line2, [0, 1], [20, 0])}px)`,
            marginTop: 8,
          }}
        >
          resolution rate
        </div>

        {/* Pay nothing */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 32,
            fontWeight: 500,
            color: colors.foreground,
            opacity: payNothing,
            transform: `translateY(${interpolate(payNothing, [0, 1], [30, 0])}px)`,
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>Or...</span>
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              color: "white",
              padding: "8px 24px",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            You pay nothing
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
