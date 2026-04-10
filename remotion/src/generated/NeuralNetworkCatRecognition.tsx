import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CheckCircle } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#ffffff",
  foreground: "#0f172a",
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  primaryDark: "#1d4ed8",
  accent: "#7c3aed",
  accentLight: "#8b5cf6",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  destructive: "#dc2626",
  warning: "#d97706",
  white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
};

const gridBg: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

const catPixels: string[][] = [
  ["#1a1a2e", "#2d2d44", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#2d2d44", "#1a1a2e"],
  ["#2d2d44", "#1a1a2e", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#1a1a2e", "#2d2d44"],
  ["#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3"],
  ["#f0e6d3", "#3a5a3a", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#3a5a3a", "#f0e6d3", "#f0e6d3"],
  ["#f0e6d3", "#f0e6d3", "#f0e6d3", "#d4a574", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3"],
  ["#f0e6d3", "#f0e6d3", "#d4a574", "#c4956a", "#d4a574", "#f0e6d3", "#f0e6d3", "#f0e6d3"],
  ["#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3"],
  ["#e0d0bd", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#f0e6d3", "#e0d0bd"],
];

const GRID_X = 100;
const GRID_Y = 300;
const CELL_SIZE = 40;
const GRID_COLS = 8;
const GRID_ROWS = 8;

const L1_X = 500;
const L2_X = 760;
const L3_X = 1020;
const CARD_X = 1240;

const L1_COUNT = 5;
const L2_COUNT = 4;
const L3_COUNT = 3;
const NODE_R = 22;
const NODE_GAP = 60;

const getNodeY = (count: number, idx: number): number => {
  const totalHeight = (count - 1) * NODE_GAP;
  const startY = GRID_Y + (GRID_ROWS * CELL_SIZE) / 2 - totalHeight / 2;
  return startY + idx * NODE_GAP;
};

export const NeuralNetworkCatRecognition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);

  const pixelSprings: number[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const idx = r * GRID_COLS + c;
      const s = spring({
        frame,
        fps,
        config: { damping: 200 },
        delay: Math.round(0.5 * fps) + idx * 1,
      });
      pixelSprings.push(s);
    }
  }

  const inputLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.8 * fps) });

  const l1Springs: number[] = [];
  for (let i = 0; i < L1_COUNT; i++) {
    l1Springs.push(
      spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3.0 * fps) + i * 3 })
    );
  }
  const l2Springs: number[] = [];
  for (let i = 0; i < L2_COUNT; i++) {
    l2Springs.push(
      spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3.3 * fps) + i * 3 })
    );
  }
  const l3Springs: number[] = [];
  for (let i = 0; i < L3_COUNT; i++) {
    l3Springs.push(
      spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3.6 * fps) + i * 3 })
    );
  }

  const connFade = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.5 * fps) });

  const layerLabelSprings = [
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.0 * fps) }),
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.3 * fps) }),
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.6 * fps) }),
  ];

  const l1ActivateStart = Math.round(6.0 * fps);
  const l1Activations: number[] = [];
  for (let i = 0; i < L1_COUNT; i++) {
    l1Activations.push(
      spring({ frame, fps, config: { damping: 200 }, delay: l1ActivateStart + i * 4 })
    );
  }

  const edgeOverlaySpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(7.5 * fps) });

  const scanLineProgress = interpolate(
    frame,
    [Math.round(5.5 * fps), Math.round(6.5 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const l2ActivateStart = Math.round(11.0 * fps);
  const l2Activations: number[] = [];
  for (let i = 0; i < L2_COUNT; i++) {
    l2Activations.push(
      spring({ frame, fps, config: { damping: 200 }, delay: l2ActivateStart + i * 5 })
    );
  }

  const earAnnotation = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(12.0 * fps) });
  const eyeAnnotation = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(12.8 * fps) });

  const dog_in = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(15.0 * fps) });
  const dogY = interpolate(dog_in, [0, 1], [20, 0]);
  const dogStrikeProgress = interpolate(
    frame,
    [Math.round(16.0 * fps), Math.round(16.5 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dogFadeOut = interpolate(
    frame,
    [Math.round(16.8 * fps), Math.round(17.2 * fps)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const bread_in = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(17.0 * fps) });
  const breadY = interpolate(bread_in, [0, 1], [20, 0]);
  const breadStrikeProgress = interpolate(
    frame,
    [Math.round(17.8 * fps), Math.round(18.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const breadFadeOut = interpolate(
    frame,
    [Math.round(18.5 * fps), Math.round(18.9 * fps)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const l3FlickerPhase = frame >= Math.round(15.0 * fps) && frame < Math.round(19.0 * fps);
  const l3FlickerOpacity = l3FlickerPhase
    ? interpolate(Math.sin(frame * 0.4), [-1, 1], [0.4, 0.9])
    : 0;

  const l3ActivateStart = Math.round(19.5 * fps);
  const l3Activations: number[] = [];
  for (let i = 0; i < L3_COUNT; i++) {
    l3Activations.push(
      spring({ frame, fps, config: { damping: 200 }, delay: l3ActivateStart + i * 3 })
    );
  }

  const finalCardSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(20.5 * fps) });
  const finalCardY = interpolate(finalCardSpring, [0, 1], [20, 0]);

  const checkIconSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(21.0 * fps) });

  const confLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(22.0 * fps) });
  const confBarStart = Math.round(22.5 * fps);
  const confBarEnd = Math.round(25.5 * fps);
  const confRaw = interpolate(frame, [confBarStart, confBarEnd], [0, 97.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const confValue = confRaw;
  const confBarWidth = interpolate(confValue, [0, 97.3], [0, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const finalFade = interpolate(
    frame,
    [Math.round(27.5 * fps), Math.round(28 * fps)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const stepText = (() => {
    if (frame < Math.round(5.5 * fps)) return "";
    if (frame < Math.round(10 * fps)) return "Step 1 of 3 — Detecting Edges";
    if (frame < Math.round(14.5 * fps)) return "Step 2 of 3 — Detecting Shapes";
    if (frame < Math.round(22 * fps)) return "Step 3 of 3 — Classification...";
    return "";
  })();

  const stepLabelOpacity = stepText
    ? interpolate(frame, [Math.round(5.5 * fps), Math.round(5.8 * fps)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const renderConnections = (
    _fromX: number,
    fromCount: number,
    toX: number,
    toCount: number,
    color: string,
    activationProgress: number
  ) => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i < fromCount; i++) {
      for (let j = 0; j < toCount; j++) {
        const y1 = getNodeY(fromCount, i);
        const y2 = getNodeY(toCount, j);
        const lineOpacity = interpolate(connFade, [0, 1], [0, 0.15]);
        const activeOpacity = interpolate(activationProgress, [0, 1], [0, 0.4]);
        lines.push(
          <line
            key={`${_fromX}-${i}-${toX}-${j}`}
            x1={_fromX + NODE_R}
            y1={y1}
            x2={toX - NODE_R}
            y2={y2}
            stroke={color}
            strokeWidth={1.5}
            opacity={Math.max(lineOpacity, activeOpacity)}
          />
        );
      }
    }
    return lines;
  };

  const l1ConnectionActive = interpolate(
    frame,
    [Math.round(6.0 * fps), Math.round(8.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const l2ConnectionActive = interpolate(
    frame,
    [Math.round(11.0 * fps), Math.round(13.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const l3ConnectionActive = interpolate(
    frame,
    [Math.round(19.0 * fps), Math.round(20.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const gridCenterY = GRID_Y + (GRID_ROWS * CELL_SIZE) / 2;

  const inputToL1Active = interpolate(
    frame,
    [Math.round(5.8 * fps), Math.round(7.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const dashFlowPath = interpolate(
    frame,
    [Math.round(26.0 * fps), Math.round(27.5 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        overflow: "hidden",
        fontFamily: inter,
        opacity: finalFade,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.5 }} />

      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          opacity: titleSpring,
          transform: `translateY(${titleY}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 13,
            fontWeight: 600,
            color: "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          HOW A NEURAL NETWORK RECOGNIZES A CAT
        </div>
        {stepText && (
          <div
            style={{
              fontFamily: inter,
              fontSize: 12,
              fontWeight: 500,
              color: colors.mutedForeground,
              marginTop: 6,
              opacity: stepLabelOpacity,
            }}
          >
            {stepText}
          </div>
        )}
      </div>

      <svg
        style={{ position: "absolute", inset: 0, width: 1920, height: 1080, zIndex: 1 }}
        viewBox="0 0 1920 1080"
      >
        {Array.from({ length: L1_COUNT }).map((_, idx) => {
          const y2 = getNodeY(L1_COUNT, idx);
          return (
            <line
              key={`input-l1-${idx}`}
              x1={GRID_X + GRID_COLS * CELL_SIZE + 10}
              y1={gridCenterY}
              x2={L1_X - NODE_R}
              y2={y2}
              stroke={colors.primary}
              strokeWidth={1}
              opacity={Math.max(
                interpolate(connFade, [0, 1], [0, 0.1]),
                interpolate(inputToL1Active, [0, 1], [0, 0.35])
              )}
            />
          );
        })}

        {renderConnections(L1_X, L1_COUNT, L2_X, L2_COUNT, colors.primary, l1ConnectionActive)}
        {renderConnections(L2_X, L2_COUNT, L3_X, L3_COUNT, colors.accent, l2ConnectionActive)}

        {(() => {
          const l3Flash = interpolate(l3ConnectionActive, [0, 0.5, 1], [0, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const lines: React.ReactNode[] = [];
          for (let i = 0; i < L2_COUNT; i++) {
            for (let j = 0; j < L3_COUNT; j++) {
              const y1 = getNodeY(L2_COUNT, i);
              const y2 = getNodeY(L3_COUNT, j);
              lines.push(
                <line
                  key={`l2l3-active-${i}-${j}`}
                  x1={L2_X + NODE_R}
                  y1={y1}
                  x2={L3_X - NODE_R}
                  y2={y2}
                  stroke={colors.success}
                  strokeWidth={2}
                  opacity={l3Flash * 0.6}
                />
              );
            }
          }
          return lines;
        })()}

        {scanLineProgress > 0 && scanLineProgress < 1 && (
          <line
            x1={GRID_X}
            y1={GRID_Y + scanLineProgress * GRID_ROWS * CELL_SIZE}
            x2={GRID_X + GRID_COLS * CELL_SIZE}
            y2={GRID_Y + scanLineProgress * GRID_ROWS * CELL_SIZE}
            stroke={colors.primary}
            strokeWidth={2}
            opacity={0.7}
          />
        )}

        {dashFlowPath > 0 && (
          <line
            x1={GRID_X + GRID_COLS * CELL_SIZE + 10}
            y1={gridCenterY}
            x2={interpolate(dashFlowPath, [0, 1], [GRID_X + GRID_COLS * CELL_SIZE + 10, CARD_X - 20])}
            y2={gridCenterY}
            stroke={colors.border}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={dashFlowPath * 0.5}
          />
        )}
      </svg>

      {catPixels.map((row, r) =>
        row.map((pixelColor, c) => {
          const idx = r * GRID_COLS + c;
          const s = pixelSprings[idx];
          return (
            <div
              key={`px-${r}-${c}`}
              style={{
                position: "absolute",
                left: GRID_X + c * CELL_SIZE,
                top: GRID_Y + r * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: pixelColor,
                borderRadius: 3,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [10, 0])}px)`,
                zIndex: 2,
              }}
            />
          );
        })
      )}

      {edgeOverlaySpring > 0 && (
        <svg
          style={{ position: "absolute", left: GRID_X, top: GRID_Y, zIndex: 3 }}
          width={GRID_COLS * CELL_SIZE}
          height={GRID_ROWS * CELL_SIZE}
        >
          <path
            d={`M ${0.5 * CELL_SIZE} ${0.5 * CELL_SIZE} L ${1.5 * CELL_SIZE} ${1.5 * CELL_SIZE} L ${2 * CELL_SIZE} ${2.5 * CELL_SIZE} L ${2 * CELL_SIZE} ${5.5 * CELL_SIZE} L ${1 * CELL_SIZE} ${7 * CELL_SIZE}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
            opacity={edgeOverlaySpring * 0.7}
            strokeDasharray={400}
            strokeDashoffset={interpolate(edgeOverlaySpring, [0, 1], [400, 0])}
          />
          <path
            d={`M ${7.5 * CELL_SIZE} ${0.5 * CELL_SIZE} L ${6.5 * CELL_SIZE} ${1.5 * CELL_SIZE} L ${6 * CELL_SIZE} ${2.5 * CELL_SIZE} L ${6 * CELL_SIZE} ${5.5 * CELL_SIZE} L ${7 * CELL_SIZE} ${7 * CELL_SIZE}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
            opacity={edgeOverlaySpring * 0.7}
            strokeDasharray={400}
            strokeDashoffset={interpolate(edgeOverlaySpring, [0, 1], [400, 0])}
          />
          <path
            d={`M ${2 * CELL_SIZE} ${5 * CELL_SIZE} Q ${4 * CELL_SIZE} ${6.5 * CELL_SIZE} ${6 * CELL_SIZE} ${5 * CELL_SIZE}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
            opacity={edgeOverlaySpring * 0.5}
            strokeDasharray={200}
            strokeDashoffset={interpolate(edgeOverlaySpring, [0, 1], [200, 0])}
          />
        </svg>
      )}

      {earAnnotation > 0 && (
        <div style={{ position: "absolute", zIndex: 4 }}>
          <svg
            style={{
              position: "absolute",
              left: GRID_X - 4,
              top: GRID_Y - 4,
            }}
            width={GRID_COLS * CELL_SIZE + 8}
            height={GRID_ROWS * CELL_SIZE + 8}
          >
            <rect
              x={-2 + 4}
              y={-2 + 4}
              width={2.5 * CELL_SIZE}
              height={2.5 * CELL_SIZE}
              rx={6}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2}
              strokeDasharray={200}
              strokeDashoffset={interpolate(earAnnotation, [0, 1], [200, 0])}
              opacity={earAnnotation * 0.8}
            />
            <rect
              x={5.5 * CELL_SIZE + 4}
              y={-2 + 4}
              width={2.5 * CELL_SIZE}
              height={2.5 * CELL_SIZE}
              rx={6}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2}
              strokeDasharray={200}
              strokeDashoffset={interpolate(earAnnotation, [0, 1], [200, 0])}
              opacity={earAnnotation * 0.8}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: GRID_X + 0.5 * CELL_SIZE,
              top: GRID_Y - 18,
              fontFamily: inter,
              fontSize: 10,
              fontWeight: 600,
              color: colors.accent,
              opacity: earAnnotation,
            }}
          >
            ear
          </div>
          <div
            style={{
              position: "absolute",
              left: GRID_X + 6 * CELL_SIZE,
              top: GRID_Y - 18,
              fontFamily: inter,
              fontSize: 10,
              fontWeight: 600,
              color: colors.accent,
              opacity: earAnnotation,
            }}
          >
            ear
          </div>
        </div>
      )}

      {eyeAnnotation > 0 && (
        <div style={{ position: "absolute", zIndex: 4 }}>
          <svg
            style={{
              position: "absolute",
              left: GRID_X,
              top: GRID_Y,
            }}
            width={GRID_COLS * CELL_SIZE}
            height={GRID_ROWS * CELL_SIZE}
          >
            <rect
              x={0.5 * CELL_SIZE}
              y={2.5 * CELL_SIZE}
              width={2 * CELL_SIZE}
              height={2 * CELL_SIZE}
              rx={6}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2}
              strokeDasharray={160}
              strokeDashoffset={interpolate(eyeAnnotation, [0, 1], [160, 0])}
              opacity={eyeAnnotation * 0.8}
            />
            <rect
              x={5 * CELL_SIZE}
              y={2.5 * CELL_SIZE}
              width={2 * CELL_SIZE}
              height={2 * CELL_SIZE}
              rx={6}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2}
              strokeDasharray={160}
              strokeDashoffset={interpolate(eyeAnnotation, [0, 1], [160, 0])}
              opacity={eyeAnnotation * 0.8}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: GRID_X + 1 * CELL_SIZE,
              top: GRID_Y + 4.7 * CELL_SIZE,
              fontFamily: inter,
              fontSize: 10,
              fontWeight: 600,
              color: colors.accent,
              opacity: eyeAnnotation,
            }}
          >
            eye
          </div>
          <div
            style={{
              position: "absolute",
              left: GRID_X + 5.5 * CELL_SIZE,
              top: GRID_Y + 4.7 * CELL_SIZE,
              fontFamily: inter,
              fontSize: 10,
              fontWeight: 600,
              color: colors.accent,
              opacity: eyeAnnotation,
            }}
          >
            eye
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: GRID_X,
          top: GRID_Y + GRID_ROWS * CELL_SIZE + 12,
          fontFamily: inter,
          fontSize: 11,
          fontWeight: 600,
          color: colors.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: inputLabelSpring,
          transform: `translateY(${interpolate(inputLabelSpring, [0, 1], [10, 0])}px)`,
          zIndex: 5,
          width: GRID_COLS * CELL_SIZE,
          textAlign: "center",
        }}
      >
        INPUT
      </div>

      {[
        { x: L1_X, count: L1_COUNT, springs: l1Springs, activations: l1Activations, color: colors.primary, lightFill: "#dbeafe", label: "LAYER 1", sub: "Edge Detection", labelSpring: layerLabelSprings[0] },
        { x: L2_X, count: L2_COUNT, springs: l2Springs, activations: l2Activations, color: colors.accent, lightFill: "#ede9fe", label: "LAYER 2", sub: "Shape Detection", labelSpring: layerLabelSprings[1] },
        { x: L3_X, count: L3_COUNT, springs: l3Springs, activations: l3Activations, color: colors.success, lightFill: "#dcfce7", label: "LAYER 3", sub: "Classification", labelSpring: layerLabelSprings[2] },
      ].map((layer, li) => {
        const layerNodes = [];
        for (let i = 0; i < layer.count; i++) {
          const ny = getNodeY(layer.count, i);
          const s = layer.springs[i];
          const a = layer.activations[i];

          const isL3 = li === 2;
          const flickerOp = isL3 && l3FlickerPhase ? l3FlickerOpacity : 0;
          const nodeOpacity = Math.max(
            interpolate(s, [0, 1], [0, 0.4]),
            interpolate(a, [0, 1], [0, 1]),
            flickerOp
          );

          const fillColor =
            a > 0.5
              ? layer.lightFill
              : isL3 && l3FlickerPhase
              ? `${layer.lightFill}80`
              : colors.white;
          const strokeColor =
            a > 0.5
              ? layer.color
              : isL3 && l3FlickerPhase
              ? `${layer.color}80`
              : colors.border;

          layerNodes.push(
            <div
              key={`node-${li}-${i}`}
              style={{
                position: "absolute",
                left: layer.x - NODE_R,
                top: ny - NODE_R,
                width: NODE_R * 2,
                height: NODE_R * 2,
                borderRadius: "50%",
                backgroundColor: fillColor,
                border: `2px solid ${strokeColor}`,
                opacity: nodeOpacity,
                transform: `translateY(${interpolate(s, [0, 1], [15, 0])}px)`,
                boxShadow: a > 0.5 ? `0 2px 8px ${layer.color}20` : "0 1px 3px rgba(0,0,0,0.06)",
                zIndex: 5,
              }}
            />
          );

          if (a > 0.1 && a < 0.95) {
            const rippleScale = interpolate(a, [0, 1], [0.8, 1.4]);
            const rippleOp = interpolate(a, [0, 0.5, 1], [0, 0.15, 0]);
            layerNodes.push(
              <div
                key={`glow-${li}-${i}`}
                style={{
                  position: "absolute",
                  left: layer.x - NODE_R * 1.4,
                  top: ny - NODE_R * 1.4,
                  width: NODE_R * 2.8,
                  height: NODE_R * 2.8,
                  borderRadius: "50%",
                  backgroundColor: layer.color,
                  opacity: rippleOp,
                  transform: `scale(${rippleScale})`,
                  zIndex: 4,
                  pointerEvents: "none" as const,
                }}
              />
            );
          }
        }

        const labelY = getNodeY(layer.count, 0) - 50;

        layerNodes.push(
          <div
            key={`label-${li}`}
            style={{
              position: "absolute",
              left: layer.x - 50,
              top: labelY,
              width: 100,
              textAlign: "center",
              opacity: layer.labelSpring,
              transform: `translateY(${interpolate(layer.labelSpring, [0, 1], [15, 0])}px)`,
              zIndex: 6,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 10,
                fontWeight: 700,
                color: layer.color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {layer.label}
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 9,
                fontWeight: 500,
                color: colors.mutedForeground,
                marginTop: 2,
              }}
            >
              {layer.sub}
            </div>
          </div>
        );

        return layerNodes;
      })}

      {dog_in > 0 && dogFadeOut > 0 && (
        <div
          style={{
            position: "absolute",
            left: CARD_X,
            top: getNodeY(L3_COUNT, 0) - 10,
            opacity: Math.min(dog_in, dogFadeOut),
            transform: `translateY(${dogY}px)`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              ...glass,
              padding: "14px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 600,
                color: colors.foreground,
              }}
            >
              dog?
            </span>
            {dogStrikeProgress > 0 && (
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <line
                  x1="5"
                  y1="5"
                  x2={interpolate(dogStrikeProgress, [0, 1], [5, 195])}
                  y2={interpolate(dogStrikeProgress, [0, 1], [5, 46])}
                  stroke={colors.destructive}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {bread_in > 0 && breadFadeOut > 0 && (
        <div
          style={{
            position: "absolute",
            left: CARD_X,
            top: getNodeY(L3_COUNT, 1),
            opacity: Math.min(bread_in, breadFadeOut),
            transform: `translateY(${breadY}px)`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              ...glass,
              padding: "14px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 600,
                color: colors.foreground,
              }}
            >
              bread?
            </span>
            {breadStrikeProgress > 0 && (
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <line
                  x1="5"
                  y1="5"
                  x2={interpolate(breadStrikeProgress, [0, 1], [5, 195])}
                  y2={interpolate(breadStrikeProgress, [0, 1], [5, 46])}
                  stroke={colors.destructive}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {finalCardSpring > 0 && (
        <div
          style={{
            position: "absolute",
            left: CARD_X,
            top: gridCenterY - 80,
            opacity: finalCardSpring,
            transform: `translateY(${finalCardY}px)`,
            zIndex: 12,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `2px solid ${colors.success}`,
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              padding: "24px 36px",
              minWidth: 320,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center" as const,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  opacity: checkIconSpring,
                  transform: `translateY(${interpolate(checkIconSpring, [0, 1], [8, 0])}px)`,
                }}
              >
                <CheckCircle size={24} color={colors.success} />
              </div>
              <span
                style={{
                  fontFamily: montserrat,
                  fontSize: 40,
                  fontWeight: 900,
                  color: colors.success,
                }}
              >
                CAT
              </span>
            </div>

            {confLabelSpring > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center" as const,
                  gap: 8,
                  opacity: confLabelSpring,
                  transform: `translateY(${interpolate(confLabelSpring, [0, 1], [10, 0])}px)`,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  CONFIDENCE
                </div>
                <div
                  style={{
                    width: 280,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#f3f4f6",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: confBarWidth,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.success,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.success,
                  }}
                >
                  {confValue.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {(() => {
        const pulses: React.ReactNode[] = [];
        const renderPulse = (
          startFrame: number,
          duration: number,
          fromX: number,
          fromY: number,
          toX: number,
          toY: number,
          pulseColor: string,
          key: string
        ) => {
          const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (progress <= 0 || progress >= 1) return null;
          const px = interpolate(progress, [0, 1], [fromX, toX]);
          const py = interpolate(progress, [0, 1], [fromY, toY]);
          const op = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: px - 4,
                top: py - 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: pulseColor,
                opacity: op * 0.8,
                zIndex: 3,
                pointerEvents: "none" as const,
              }}
            />
          );
        };

        for (let i = 0; i < L1_COUNT; i++) {
          const p = renderPulse(
            Math.round(5.8 * fps) + i * 4,
            12,
            GRID_X + GRID_COLS * CELL_SIZE,
            gridCenterY,
            L1_X - NODE_R,
            getNodeY(L1_COUNT, i),
            colors.primary,
            `pulse-input-l1-${i}`
          );
          if (p) pulses.push(p);
        }

        for (let i = 0; i < L1_COUNT; i++) {
          for (let j = 0; j < L2_COUNT; j++) {
            const p = renderPulse(
              Math.round(10.5 * fps) + i * 2 + j * 3,
              10,
              L1_X + NODE_R,
              getNodeY(L1_COUNT, i),
              L2_X - NODE_R,
              getNodeY(L2_COUNT, j),
              colors.accent,
              `pulse-l1-l2-${i}-${j}`
            );
            if (p) pulses.push(p);
          }
        }

        for (let i = 0; i < L2_COUNT; i++) {
          for (let j = 0; j < L3_COUNT; j++) {
            const p = renderPulse(
              Math.round(19.2 * fps) + i * 2 + j * 2,
              10,
              L2_X + NODE_R,
              getNodeY(L2_COUNT, i),
              L3_X - NODE_R,
              getNodeY(L3_COUNT, j),
              colors.success,
              `pulse-l2-l3-${i}-${j}`
            );
            if (p) pulses.push(p);
          }
        }

        return pulses;
      })()}
    </AbsoluteFill>
  );
};