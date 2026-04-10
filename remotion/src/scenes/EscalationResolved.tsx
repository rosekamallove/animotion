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

const resolvedTickets = [
  { name: "Steven M.", issue: "Dashboard access issue" },
  { name: "Jason M.", issue: "Knowledge base query" },
  { name: "Chris A.", issue: "Data export help" },
  { name: "Sarah C.", issue: "Password reset" },
];

export const EscalationResolved: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: "And when it's unsure?" (0-1.5s)
  const unsureText = spring({ frame, fps, config: { damping: 200 } });

  // Phase 2: Escalation chat (1.5-3s)
  const escalateDelay = Math.round(1.5 * fps);
  const escalateProgress = spring({ frame, fps, config: { damping: 200 }, delay: escalateDelay });
  const davidMsg = spring({ frame, fps, config: { damping: 200 }, delay: escalateDelay + Math.round(0.6 * fps) });

  // Phase 3: Resolved stamps (3s+)
  const resolveDelay = Math.round(3.0 * fps);

  // Phase 4: Stats
  const statsDelay = Math.round(3.8 * fps);
  const statsProgress = spring({ frame, fps, config: { damping: 14 }, delay: statsDelay });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily: inter, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* "And when it's unsure?" */}
        <div
          style={{
            opacity: unsureText,
            transform: `translateY(${interpolate(unsureText, [0, 1], [20, 0])}px)`,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontFamily: montserrat, fontSize: 40, fontWeight: 900, color: colors.foreground }}>
            And when it's unsure?
          </span>
        </div>

        {/* Escalation visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            opacity: escalateProgress,
            transform: `translateY(${interpolate(escalateProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          {/* AI tag */}
          <div
            style={{
              ...glass,
              background: "rgba(255,255,255,0.9)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: colors.foreground }}>Helply AI</span>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 60, height: 2, backgroundColor: colors.primary }} />
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: `12px solid ${colors.primary}`,
              }}
            />
          </div>

          {/* Human agent card */}
          <div
            style={{
              ...glass,
              background: "rgba(255,255,255,0.9)",
              padding: "16px 24px",
              opacity: davidMsg,
              transform: `scale(${davidMsg})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                D
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.foreground }}>David</div>
                <div style={{ fontSize: 11, color: colors.success }}>Human Agent</div>
              </div>
            </div>
            <div
              style={{
                fontSize: 14,
                color: colors.foreground,
                background: colors.muted,
                padding: "10px 16px",
                borderRadius: 10,
                maxWidth: 280,
                lineHeight: 1.4,
              }}
            >
              Hi, it's David here. Fixing the issue right away.
            </div>
          </div>
        </div>

        {/* Resolved tickets strip */}
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {resolvedTickets.map((ticket, i) => {
            const stampProgress = spring({
              frame,
              fps,
              config: { damping: 10, stiffness: 150 },
              delay: resolveDelay + Math.round(i * 0.15 * fps),
            });

            return (
              <div
                key={ticket.name}
                style={{
                  ...glass,
                  background: "rgba(255,255,255,0.9)",
                  padding: "14px 20px",
                  width: 200,
                  position: "relative",
                  opacity: interpolate(stampProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.foreground }}>{ticket.name}</div>
                <div style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}>{ticket.issue}</div>

                {/* Resolved stamp */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${stampProgress}) rotate(-12deg)`,
                    border: `3px solid ${colors.primary}`,
                    borderRadius: 8,
                    padding: "4px 14px",
                    opacity: stampProgress,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 900, color: colors.primary, letterSpacing: 2 }}>
                    RESOLVED
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats bar */}
        <div
          style={{
            opacity: statsProgress,
            transform: `scale(${statsProgress})`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 8,
          }}
        >
          <div
            style={{
              ...glass,
              background: `linear-gradient(135deg, ${colors.primary}10, ${colors.primaryLight}10)`,
              border: `1px solid ${colors.primary}20`,
              padding: "16px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: montserrat, fontSize: 48, fontWeight: 900, color: colors.primary }}>
              74%
            </div>
            <div style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 4 }}>
              increase in resolved rate
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
