import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { MacOSCursor } from "../MacOSCursor";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const sidebarItems = [
  { icon: "📥", label: "Inbox", active: true, count: 12 },
  { icon: "🤖", label: "AI Agent", active: false },
  { icon: "📊", label: "Analytics", active: false },
  { icon: "📚", label: "Knowledge Base", active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

const chatMessages = [
  {
    sender: "customer",
    name: "Jason Miller",
    text: "Hey, how do I attach a knowledge base article to a ticket reply?",
  },
  {
    sender: "ai",
    name: "Helply AI",
    text: 'Click the 📎 icon in the reply toolbar, then select "Knowledge Base". You can search and attach any article directly to your response.',
  },
];

export const LogoDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Logo appears (0-2s)
  const logoProgress = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });

  // Phase 2: Logo shrinks and moves, dashboard appears (2s+)
  const dashboardDelay = Math.round(1.8 * fps);
  const dashProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: dashboardDelay,
  });

  const logoScale = interpolate(dashProgress, [0, 1], [1, 0.35]);
  const logoX = interpolate(dashProgress, [0, 1], [960, 100]);
  const logoY = interpolate(dashProgress, [0, 1], [540, 42]);

  // Chat messages appear staggered
  const msg1Progress = spring({ frame, fps, config: { damping: 200 }, delay: dashboardDelay + Math.round(0.5 * fps) });
  const msg2Progress = spring({ frame, fps, config: { damping: 200 }, delay: dashboardDelay + Math.round(1.2 * fps) });
  const msgProgresses = [msg1Progress, msg2Progress];

  // Cursor animation
  const cursorX = interpolate(frame, [dashboardDelay, dashboardDelay + 60], [1400, 850], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const cursorY = interpolate(frame, [dashboardDelay, dashboardDelay + 60], [200, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily, overflow: "hidden" }}>
      {/* Subtle gradient bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          left: logoX,
          top: logoY,
          transform: `scale(${logoScale * logoProgress})`,
          transformOrigin: "center center",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>H</span>
        </div>
        <span style={{ fontSize: 42, fontWeight: 700, color: colors.foreground }}>Helply</span>
      </div>

      {/* Dashboard */}
      <div
        style={{
          position: "absolute",
          inset: 40,
          top: 90,
          opacity: dashProgress,
          transform: `translateY(${interpolate(dashProgress, [0, 1], [30, 0])}px)`,
          display: "flex",
          gap: 0,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 12px 48px rgba(0,0,0,0.06)",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            backgroundColor: colors.muted,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {sidebarItems.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                backgroundColor: item.active ? "white" : "transparent",
                boxShadow: item.active ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                fontSize: 15,
                fontWeight: item.active ? 600 : 400,
                color: item.active ? colors.foreground : colors.mutedForeground,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.count && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: colors.primary,
                    color: "white",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Main content - Chat */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 16,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              J
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.foreground }}>
                Jason Miller
              </div>
              <div style={{ fontSize: 12, color: colors.mutedForeground }}>
                Ticket #4821 - Knowledge Base
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                background: `${colors.success}18`,
                color: colors.success,
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 8,
              }}
            >
              AI Handling
            </div>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {chatMessages.map((msg, i) => {
              const progress = msgProgresses[i];
              const isAI = msg.sender === "ai";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isAI ? "flex-start" : "flex-end",
                    opacity: progress,
                    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "14px 18px",
                      borderRadius: 16,
                      borderTopLeftRadius: isAI ? 4 : 16,
                      borderTopRightRadius: isAI ? 16 : 4,
                      backgroundColor: isAI ? colors.muted : colors.primary,
                      color: isAI ? colors.foreground : "white",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {isAI && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.primary,
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🤖 Helply AI
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cursor */}
      {frame > dashboardDelay && (
        <MacOSCursor x={cursorX} y={cursorY} />
      )}
    </AbsoluteFill>
  );
};
