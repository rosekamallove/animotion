import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors, glass } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const tickets = [
  { name: "Steven Miller", text: "I can't access my dashboard...", x: -200, y: 80, rot: -8, speed: 1.2 },
  { name: "Jason Miller", text: "Billing issue with my account", x: 1400, y: 200, rot: 12, speed: -1.0 },
  { name: "Chris Anderson", text: "How do I export my data?", x: -300, y: 400, rot: -5, speed: 1.4 },
  { name: "Sarah Chen", text: "Password reset not working", x: 1500, y: 550, rot: 8, speed: -1.3 },
  { name: "Alex Johnson", text: "Feature request: dark mode", x: -150, y: 700, rot: -12, speed: 1.1 },
  { name: "Maria Garcia", text: "Integration with Slack broken", x: 1600, y: 350, rot: 6, speed: -0.9 },
  { name: "Tom Wilson", text: "Downgrade my subscription", x: -250, y: 150, rot: 10, speed: 1.5 },
  { name: "Emma Davis", text: "Can't invite team members", x: 1300, y: 650, rot: -7, speed: -1.2 },
];

const TicketCard: React.FC<{
  name: string;
  text: string;
  startX: number;
  y: number;
  rotation: number;
  speed: number;
}> = ({ name, text, startX, y, rotation, speed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const x = interpolate(
    frame,
    [0, durationInFrames],
    [startX, startX + speed * 800],
  );
  const wobbleY = y + Math.sin(frame * 0.08 + startX * 0.01) * 30;
  const rot = rotation + Math.sin(frame * 0.05) * 3;

  return (
    <div
      style={{
        ...glass,
        position: "absolute",
        left: x,
        top: wobbleY,
        width: 320,
        padding: "16px 20px",
        transform: `rotate(${rot}deg)`,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {name[0]}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.foreground }}>{name}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: colors.mutedForeground,
            background: colors.muted,
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          Open
        </span>
      </div>
      <div style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 1.4 }}>{text}</div>
    </div>
  );
};

export const FlyingTickets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14 },
    delay: Math.round(0.8 * fps),
  });
  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleScale = titleProgress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {tickets.map((t, i) => (
        <TicketCard
          key={i}
          name={t.name}
          text={t.text}
          startX={t.x}
          y={t.y}
          rotation={t.rot}
          speed={t.speed}
        />
      ))}

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...glass,
            background: "rgba(255,255,255,0.92)",
            padding: "32px 56px",
            transform: `scale(${titleScale}) translateY(${titleY}px)`,
            opacity: titleProgress,
            boxShadow: "0 12px 48px rgba(37, 99, 235, 0.15)",
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: colors.foreground,
            }}
          >
            Too many support tickets?
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
