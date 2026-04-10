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

const actions = [
  {
    title: "Refund Processed",
    description: "$49.99 refunded to Visa ****4821",
    icon: "💳",
    status: "Completed",
    statusColor: "#22c55e",
  },
  {
    title: "Invoice Sent",
    description: "INV-2847 - $299.00 marked as paid",
    icon: "📄",
    status: "Paid",
    statusColor: "#3b82f6",
  },
  {
    title: "Plan Upgraded",
    description: "Basic → Pro (effective immediately)",
    icon: "🚀",
    status: "Active",
    statusColor: "#8b5cf6",
  },
  {
    title: "Team Member Added",
    description: "sarah@company.io added as Editor",
    icon: "👤",
    status: "Joined",
    statusColor: "#f59e0b",
  },
];

export const ActionCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineProgress = spring({ frame, fps, config: { damping: 200 } });
  const subProgress = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.5 * fps) });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily: inter, overflow: "hidden" }}>
      {/* Subtle background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(37,99,235,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headlineProgress,
          transform: `translateY(${interpolate(headlineProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: montserrat, fontSize: 44, fontWeight: 900, color: colors.foreground }}>
          Helply doesn't just auto-reply.{" "}
          <span style={{ color: colors.primary }}>It acts.</span>
        </div>
      </div>

      {/* Action cards grid */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 120,
          right: 120,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {actions.map((action, i) => {
          const cardDelay = Math.round(0.6 * fps + i * 0.2 * fps);
          const cardProgress = spring({
            frame,
            fps,
            config: { damping: 14, stiffness: 100 },
            delay: cardDelay,
          });

          const checkDelay = cardDelay + Math.round(0.4 * fps);
          const checkProgress = spring({
            frame,
            fps,
            config: { damping: 10, stiffness: 150 },
            delay: checkDelay,
          });

          return (
            <div
              key={action.title}
              style={{
                ...glass,
                background: "rgba(255,255,255,0.9)",
                padding: 28,
                opacity: cardProgress,
                transform: `scale(${interpolate(cardProgress, [0, 1], [0.85, 1])}) translateY(${interpolate(cardProgress, [0, 1], [30, 0])}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: colors.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 17, fontWeight: 700, color: colors.foreground }}>
                      {action.title}
                    </span>

                    {/* Animated checkmark */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: `${action.statusColor}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `scale(${checkProgress})`,
                      }}
                    >
                      <span style={{ color: action.statusColor, fontSize: 14, fontWeight: 700 }}>
                        ✓
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 6, lineHeight: 1.4 }}>
                    {action.description}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: action.statusColor,
                    }}
                  >
                    {action.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Zero human oversight" */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: subProgress,
          transform: `translateY(${interpolate(subProgress, [0, 1], [15, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: colors.foreground,
          }}
        >
          All with{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              color: "white",
              padding: "4px 16px",
              borderRadius: 8,
            }}
          >
            zero human oversight
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
