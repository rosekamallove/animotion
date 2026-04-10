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
import { colors, glass } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const chatFlow = [
  { sender: "user", name: "John", text: "I can't edit in my workspace." },
  {
    sender: "ai",
    name: "Helply AI",
    text: "Sorry about that, John. I see you have a 'view only' role. Contact your admin to have them change your role to 'writer'.",
  },
];

const mobileCards = [
  { title: "Refund Processed", amount: "$49.99", status: "Completed", color: "#22c55e" },
  { title: "Team Member Added", name: "sarah@co.io", status: "Active", color: "#3b82f6" },
  { title: "Invoice Downloaded", id: "INV-2847", status: "Sent", color: "#8b5cf6" },
];

export const ChatInterface: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Chat messages appear
  const msg1 = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.3 * fps) });
  const typing = interpolate(frame, [Math.round(1.0 * fps), Math.round(1.5 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const msg2 = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.6 * fps) });

  // "Always available" text
  const taglineDelay = Math.round(3.0 * fps);
  const tagline = spring({ frame, fps, config: { damping: 200 }, delay: taglineDelay });

  // Mobile cards phase (after chat)
  const cardsDelay = Math.round(3.5 * fps);

  // Cursor
  const cursorPhase = interpolate(frame, [0, Math.round(0.8 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const cursorX = interpolate(cursorPhase, [0, 1], [500, 700]);
  const cursorY = interpolate(cursorPhase, [0, 1], [300, 380]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, fontFamily, overflow: "hidden" }}>
      {/* Grid bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
        }}
      >
        {/* Chat window */}
        <div
          style={{
            ...glass,
            background: "rgba(255,255,255,0.9)",
            width: 560,
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 12px 48px rgba(0,0,0,0.08)",
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: colors.success,
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.foreground }}>
              Helply AI Support
            </span>
          </div>

          {/* Messages */}
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: 280 }}>
            {/* User message */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                opacity: msg1,
                transform: `translateY(${interpolate(msg1, [0, 1], [15, 0])}px)`,
              }}
            >
              <div
                style={{
                  background: colors.primary,
                  color: "white",
                  padding: "12px 18px",
                  borderRadius: "16px 16px 4px 16px",
                  fontSize: 14,
                  maxWidth: "75%",
                }}
              >
                {chatFlow[0].text}
              </div>
            </div>

            {/* Typing indicator */}
            {typing > 0 && msg2 < 0.5 && (
              <div style={{ display: "flex", opacity: typing }}>
                <div
                  style={{
                    background: colors.muted,
                    padding: "12px 18px",
                    borderRadius: "16px 16px 16px 4px",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: colors.mutedForeground,
                        opacity: interpolate(
                          (frame + i * 5) % 20,
                          [0, 10, 20],
                          [0.3, 1, 0.3]
                        ),
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* AI response */}
            <div
              style={{
                display: "flex",
                opacity: msg2,
                transform: `translateY(${interpolate(msg2, [0, 1], [15, 0])}px)`,
              }}
            >
              <div
                style={{
                  background: colors.muted,
                  color: colors.foreground,
                  padding: "12px 18px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: 14,
                  maxWidth: "80%",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: colors.primary, marginBottom: 6 }}>
                  🤖 Helply AI
                </div>
                {chatFlow[1].text}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile cards stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mobileCards.map((card, i) => {
            const cardProgress = spring({
              frame,
              fps,
              config: { damping: 14 },
              delay: cardsDelay + Math.round(i * 0.2 * fps),
            });

            return (
              <div
                key={card.title}
                style={{
                  ...glass,
                  background: "rgba(255,255,255,0.9)",
                  width: 300,
                  padding: "18px 22px",
                  opacity: cardProgress,
                  transform: `translateX(${interpolate(cardProgress, [0, 1], [60, 0])}px) scale(${interpolate(cardProgress, [0, 1], [0.9, 1])})`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.foreground }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>
                      {card.amount || card.name || card.id}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: card.color,
                      background: `${card.color}15`,
                      padding: "4px 10px",
                      borderRadius: 8,
                    }}
                  >
                    {card.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Always available text */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: tagline,
          transform: `translateY(${interpolate(tagline, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 700,
            color: colors.foreground,
            letterSpacing: 2,
          }}
        >
          Always available. Always reliable.
        </span>
      </div>

      {frame < Math.round(1.5 * fps) && <MacOSCursor x={cursorX} y={cursorY} />}
    </AbsoluteFill>
  );
};
