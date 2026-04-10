import React from "react";

export const MacOSCursor: React.FC<{
  x: number;
  y: number;
  scale?: number;
  clicking?: boolean;
}> = ({ x, y, scale = 2.2, clicking = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${clicking ? scale * 0.9 : scale})`,
      transformOrigin: "top left",
      zIndex: 100,
      filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))",
      pointerEvents: "none",
    }}
  >
    <svg width="17" height="23" viewBox="0 0 17 23" fill="none">
      <path
        d="M1 1L1 18.5L5.5 14L9 21.5L12 20L8.5 12.5L14 12.5L1 1Z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
