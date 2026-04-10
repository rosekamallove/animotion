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
import { colors, glass } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered reveals
  const tagline1 = spring({ frame, fps, config: { damping: 200 } });
  const tagline2 = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.5 * fps) });
  const logoProgress = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, delay: Math.round(1.2 * fps) });
  const guarantee = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.0 * fps) });
  const ctaButton = spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay: Math.round(2.5 * fps) });
  const url = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3.0 * fps) });

  // Pulsing button glow
  const pulse = interpolate(
    frame % Math.round(1.5 * fps),
    [0, Math.round(0.75 * fps), Math.round(1.5 * fps)],
    [0.3, 1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily: inter, overflow: "hidden" }}>
      {/* Background radial accents */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(37,99,235,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.04) 0%, transparent 50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* Taglines */}
        <div
          style={{
            opacity: tagline1,
            transform: `translateY(${interpolate(tagline1, [0, 1], [20, 0])}px)`,
            fontSize: 28,
            fontWeight: 700,
            color: colors.foreground,
          }}
        >
          Half the tickets. Zero the guesswork.
        </div>

        <div
          style={{
            opacity: tagline2,
            transform: `translateY(${interpolate(tagline2, [0, 1], [20, 0])}px)`,
            fontSize: 20,
            color: colors.mutedForeground,
            marginBottom: 20,
          }}
        >
          No confusion. Just resolution.
        </div>

        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoProgress})`,
            opacity: logoProgress,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${colors.primary}30`,
            }}
          >
            <span style={{ color: "white", fontSize: 36, fontWeight: 700, fontFamily: montserrat }}>
              H
            </span>
          </div>
          <span style={{ fontFamily: montserrat, fontSize: 56, fontWeight: 900, color: colors.foreground }}>
            Helply
          </span>
        </div>

        {/* Guarantee badge */}
        <div
          style={{
            opacity: guarantee,
            transform: `translateY(${interpolate(guarantee, [0, 1], [15, 0])}px)`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              ...glass,
              background: `linear-gradient(135deg, ${colors.primary}08, ${colors.primaryLight}08)`,
              border: `1px solid ${colors.primary}20`,
              padding: "12px 28px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>
              Guaranteed resolution or it's FREE
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${ctaButton})`,
            opacity: ctaButton,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              padding: "18px 52px",
              borderRadius: 14,
              boxShadow: `0 0 ${30 * pulse}px ${colors.primary}${Math.round(40 * pulse).toString(16).padStart(2, "0")}, 0 8px 24px ${colors.primary}30`,
              cursor: "pointer",
            }}
          >
            Try it now
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: url,
            marginTop: 16,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 500, color: colors.mutedForeground, letterSpacing: 1 }}>
            helply.com
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
