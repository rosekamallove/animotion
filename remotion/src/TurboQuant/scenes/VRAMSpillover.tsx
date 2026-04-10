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
import { Cpu, HardDrive, ArrowDown } from "lucide-react";
import { tqColors, tqGlass, gridBackground } from "../theme";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Data blocks that spill from GPU to System RAM
const NUM_BLOCKS = 8;
const blocks = Array.from({ length: NUM_BLOCKS }, (_, i) => ({
  id: i,
  color: i % 2 === 0 ? tqColors.primary : tqColors.accent,
  label: i % 2 === 0 ? "K" : "V",
}));

export const VRAMSpillover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // GPU card appears
  const gpuSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: Math.round(0.3 * fps),
  });

  // GPU VRAM bar fills to 100%
  const vramFill = interpolate(
    frame,
    [Math.round(0.8 * fps), Math.round(2.5 * fps)],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const vramHue = interpolate(vramFill, [0, 50, 85, 100], [120, 60, 20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "FULL" label
  const fullSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
    delay: Math.round(2.8 * fps),
  });

  // Spilling arrows appear
  const arrowSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.2 * fps),
  });

  // Blocks spill down one by one
  const blockSprings = blocks.map((_, i) =>
    spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 80 },
      delay: Math.round((3.5 + i * 0.2) * fps),
    }),
  );

  // System RAM card appears
  const ramSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(3.0 * fps),
  });

  // System RAM bar fills slowly
  const ramFill = interpolate(
    frame,
    [Math.round(3.5 * fps), Math.round(5.5 * fps)],
    [0, 35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Latency counter
  const latencyStart = Math.round(3.5 * fps);
  const latencyEnd = Math.round(6.5 * fps);
  const latencyMs = interpolate(
    frame,
    [latencyStart, latencyEnd],
    [10, 2400],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const latencySpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2.0 * fps),
  });

  const isSwapping = frame > Math.round(3.5 * fps);

  // GPU shake when full
  const gpuShakeX = vramFill > 95 ? Math.sin(frame * 0.8) * 3 : 0;
  const gpuShakeY = vramFill > 95 ? Math.cos(frame * 1.1) * 2 : 0;

  // Red pulse
  const redPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.4, 1]);

  // Bottom text
  const bottomSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(7.0 * fps),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: inter,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBackground, opacity: 0.3 }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          zIndex: 1,
        }}
      >
        {/* Latency counter — top right */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            opacity: latencySpring,
            transform: `translateY(${interpolate(latencySpring, [0, 1], [15, 0])}px)`,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "14px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tqColors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Inference Latency
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 32,
                fontWeight: 700,
                color: latencyMs > 500
                  ? tqColors.destructive
                  : latencyMs > 100
                    ? tqColors.warning
                    : tqColors.success,
                textShadow: latencyMs > 500
                  ? `0 0 ${12 * redPulse}px ${tqColors.destructive}60`
                  : undefined,
              }}
            >
              {Math.round(latencyMs)}ms
            </div>
          </div>
        </div>

        {/* GPU VRAM Card */}
        <div
          style={{
            opacity: gpuSpring,
            transform: `scale(${interpolate(gpuSpring, [0, 1], [0.8, 1])}) translate(${gpuShakeX}px, ${gpuShakeY}px)`,
            width: 700,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "28px 36px",
              borderTop: `3px solid ${vramFill > 95 ? tqColors.destructive : tqColors.primary}`,
              boxShadow: vramFill > 95
                ? `0 0 ${20 * redPulse}px ${tqColors.destructive}30, 0 4px 24px rgba(0,0,0,0.3)`
                : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Cpu size={22} color={tqColors.primary} />
              <span style={{ fontFamily: montserrat, fontSize: 20, fontWeight: 900, color: tqColors.foreground }}>
                GPU VRAM
              </span>
              <span style={{ fontSize: 14, color: tqColors.mutedForeground, marginLeft: "auto" }}>
                48 GB
              </span>
              {vramFill > 95 && (
                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: tqColors.destructive,
                    padding: "2px 10px",
                    borderRadius: 4,
                    backgroundColor: `${tqColors.destructive}20`,
                    opacity: fullSpring,
                    transform: `scale(${interpolate(fullSpring, [0, 1], [0.5, 1])})`,
                  }}
                >
                  FULL
                </span>
              )}
            </div>
            <div style={{ width: "100%", height: 20, borderRadius: 6, backgroundColor: tqColors.muted, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(vramFill, 100)}%`,
                  height: "100%",
                  borderRadius: 6,
                  background: `hsl(${vramHue}, 80%, 50%)`,
                  boxShadow: vramFill > 90 ? `0 0 12px hsl(${vramHue}, 80%, 50%, 0.5)` : undefined,
                }}
              />
            </div>
          </div>
        </div>

        {/* Spilling arrows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: arrowSpring,
          }}
        >
          {[0, 1, 2].map((i) => {
            const bounce = interpolate(
              Math.sin((frame - i * 4) * 0.12),
              [-1, 1],
              [0, 6],
            );
            return (
              <ArrowDown
                key={i}
                size={20}
                color={tqColors.destructive}
                style={{
                  opacity: interpolate(i, [0, 2], [1, 0.4]),
                  transform: `translateY(${isSwapping ? bounce : 0}px)`,
                }}
              />
            );
          })}
          <span
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: tqColors.destructive,
              opacity: arrowSpring,
              marginTop: 2,
            }}
          >
            swapping to system memory
          </span>
        </div>

        {/* System RAM Card */}
        <div
          style={{
            opacity: ramSpring,
            transform: `translateY(${interpolate(ramSpring, [0, 1], [30, 0])}px)`,
            width: 700,
          }}
        >
          <div
            style={{
              ...tqGlass,
              padding: "28px 36px",
              borderTop: `3px solid ${tqColors.mutedForeground}`,
              opacity: 0.7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <HardDrive size={22} color={tqColors.mutedForeground} />
              <span style={{ fontFamily: montserrat, fontSize: 20, fontWeight: 900, color: tqColors.mutedForeground }}>
                System RAM
              </span>
              <span style={{ fontSize: 14, color: tqColors.mutedForeground, marginLeft: "auto" }}>
                10-100x slower
              </span>
            </div>
            <div style={{ width: "100%", height: 20, borderRadius: 6, backgroundColor: tqColors.muted, overflow: "hidden" }}>
              <div
                style={{
                  width: `${ramFill}%`,
                  height: "100%",
                  borderRadius: 6,
                  backgroundColor: tqColors.mutedForeground,
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Spilled blocks */}
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              {blocks.map((block, i) => {
                const s = blockSprings[i];
                return (
                  <div
                    key={block.id}
                    style={{
                      width: 36,
                      height: 24,
                      borderRadius: 4,
                      backgroundColor: `${block.color}20`,
                      border: `1px solid ${block.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: block.color,
                      opacity: s,
                      transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})`,
                    }}
                  >
                    {block.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: bottomSpring,
          transform: `translateY(${interpolate(bottomSpring, [0, 1], [10, 0])}px)`,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600, color: tqColors.mutedForeground }}>
          The system{" "}
          <span style={{ color: tqColors.destructive, fontWeight: 700 }}>crawls to a halt.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
