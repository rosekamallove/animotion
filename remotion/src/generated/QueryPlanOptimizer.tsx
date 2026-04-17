import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Zap, Search, ArrowDown } from "lucide-react";

const { fontFamily: montserrat } = loadMontserrat("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const colors = {
  background: "#f8fafc", foreground: "#0f172a", primary: "#00d4ff",
  primaryLight: "#38bdf8", primaryDark: "#0284c7", accent: "#a855f7",
  accentLight: "#c084fc", muted: "#f1f5f9", mutedForeground: "#64748b",
  border: "#cbd5e1", success: "#22c55e", destructive: "#ef4444",
  warning: "#f59e0b", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
};

const gridBg: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

const sqlText = "SELECT * FROM orders JOIN users ON orders.user_id = users.id WHERE users.country = 'US' ORDER BY orders.total DESC";

interface TreeNode {
  label: string;
  cost: number;
  x: number;
  y: number;
  color: string;
  children?: number[];
}

export const QueryPlanOptimizer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase = frame < 3 * fps ? "PARSE" : frame < 7 * fps ? "ANALYZE" : frame < 19 * fps ? "OPTIMIZE" : "EXECUTE";

  const phaseLabelSpring = spring({ frame, fps, config: { damping: 200 }, delay: 2 });

  const sqlCardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: Math.round(0.3 * fps) });
  const sqlCardY = interpolate(sqlCardSpring, [0, 1], [-80, 0]);
  const charsVisible = Math.floor(interpolate(frame, [Math.round(0.5 * fps), Math.round(2.5 * fps)], [0, sqlText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const naiveNodes: TreeNode[] = [
    { label: "Sort", cost: 12400, x: 0, y: 0, color: colors.destructive, children: [1] },
    { label: "Filter", cost: 3200, x: 0, y: 1, color: colors.warning, children: [2] },
    { label: "Nested Loop", cost: 8900, x: 0, y: 2, color: colors.destructive, children: [3, 4] },
    { label: "SeqScan(orders)", cost: 4200, x: -1, y: 3, color: colors.warning },
    { label: "SeqScan(users)", cost: 4700, x: 1, y: 3, color: colors.destructive },
  ];

  const treeBaseX = 960;
  const treeBaseY = 340;
  const nodeSpacingX = 200;
  const nodeSpacingY = 110;

  const getNodePos = (node: TreeNode) => ({
    px: treeBaseX + node.x * nodeSpacingX,
    py: treeBaseY + node.y * nodeSpacingY,
  });

  const nodeSprings = naiveNodes.map((_, i) =>
    spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay: Math.round(3.2 * fps) + i * 6 })
  );

  const connectorSprings = naiveNodes.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3.5 * fps) + i * 6 })
  );

  const costSprings = naiveNodes.map((_, i) =>
    spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4.0 * fps) + i * 5 })
  );

  const scannerStart = Math.round(7 * fps);
  const scannerEnd = Math.round(9.5 * fps);
  const scanProgress = interpolate(frame, [scannerStart, scannerEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanY = interpolate(scanProgress, [0, 1], [treeBaseY - 40, treeBaseY + 3 * nodeSpacingY + 40]);
  const scanOpacity = frame >= scannerStart && frame <= scannerEnd ? 1 : 0;

  const step1Start = Math.round(9.5 * fps);
  const step1LabelSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: step1Start + 4 });

  const predicatePushdown = spring({ frame, fps, config: { damping: 18, stiffness: 80 }, delay: Math.round(10.5 * fps) });

  const step2Start = Math.round(13 * fps);
  const step2LabelSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: step2Start + 4 });
  const indexSwap = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: Math.round(14 * fps) });
  const shakeActive = frame >= Math.round(13.3 * fps) && frame < Math.round(14 * fps);
  const shakeX = shakeActive ? Math.sin(frame * 1.2) * 6 : 0;
  const shakeY = shakeActive ? Math.cos(frame * 1.5) * 4 : 0;

  const indexCostStart = Math.round(14 * fps);
  const indexCostEnd = Math.round(14.8 * fps);
  const indexCostValue = interpolate(frame, [indexCostStart, indexCostEnd], [8900, 420], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const step3Start = Math.round(16 * fps);
  const step3LabelSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: step3Start + 4 });
  const hashJoinSwap = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, delay: Math.round(17 * fps) });
  const joinShakeActive = frame >= Math.round(16.3 * fps) && frame < Math.round(17 * fps);
  const joinShakeX = joinShakeActive ? Math.sin(frame * 1.2) * 6 : 0;

  const totalCostStart = Math.round(17.5 * fps);
  const totalCostEnd = Math.round(18.2 * fps);
  const totalCostValue = interpolate(frame, [totalCostStart, totalCostEnd], [12400, 870], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const comparisonStart = Math.round(19 * fps);
  const compSpring = spring({ frame, fps, config: { damping: 200 }, delay: comparisonStart + 4 });
  const compSlideX = interpolate(compSpring, [0, 1], [200, 0]);
  const barBeforeFill = interpolate(frame, [comparisonStart + 10, comparisonStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barAfterFill = interpolate(frame, [comparisonStart + 20, comparisonStart + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const speedupSpring = spring({ frame, fps, config: { damping: 8, stiffness: 150, mass: 1.2 }, delay: Math.round(20.5 * fps) });
  const speedupScale = interpolate(speedupSpring, [0, 1], [0.3, 1]);

  const glowPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1]);

  const showNaiveTree = frame >= Math.round(3 * fps) && frame < Math.round(19 * fps);
  const showComparison = frame >= Math.round(19 * fps);

  const getCurrentNodeLabel = (i: number): string => {
    if (i === 1 && predicatePushdown > 0.5) return "";
    if (i === 4 && indexSwap > 0.5) return "IndexScan(users)";
    if (i === 2 && hashJoinSwap > 0.5) return "Hash Join";
    return naiveNodes[i].label;
  };

  const getCurrentNodeColor = (i: number): string => {
    if (i === 4 && indexSwap > 0.5) return colors.primary;
    if (i === 2 && hashJoinSwap > 0.5) return colors.accent;
    if (i === 3 && hashJoinSwap > 0.5) return colors.success;
    if (i === 0 && hashJoinSwap > 0.5) return colors.success;
    return naiveNodes[i].color;
  };

  const getCurrentNodeCost = (i: number): number => {
    if (i === 0) return Math.round(totalCostValue);
    if (i === 2 && frame >= indexCostStart) return Math.round(indexCostValue);
    if (i === 4 && indexSwap > 0.5) return 120;
    return naiveNodes[i].cost;
  };

  const getFilterYOffset = (): number => {
    if (predicatePushdown <= 0) return 0;
    return interpolate(predicatePushdown, [0, 1], [0, nodeSpacingY * 2]);
  };

  const getFilterXOffset = (): number => {
    if (predicatePushdown <= 0) return 0;
    return interpolate(predicatePushdown, [0, 1], [0, nodeSpacingX]);
  };

  const getAdjustedNodePos = (i: number) => {
    const base = getNodePos(naiveNodes[i]);
    if (i === 1) {
      return {
        px: base.px + getFilterXOffset(),
        py: base.py + getFilterYOffset(),
      };
    }
    if (predicatePushdown > 0.5) {
      if (i === 2) {
        const moveUp = interpolate(predicatePushdown, [0.5, 1], [0, -nodeSpacingY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return { px: base.px, py: base.py + moveUp };
      }
      if (i === 3 || i === 4) {
        const moveUp = interpolate(predicatePushdown, [0.5, 1], [0, -nodeSpacingY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return { px: base.px, py: base.py + moveUp };
      }
    }
    return base;
  };

  const currentStepLabel = frame >= step3Start ? "Step 3: Hash Join Substitution" : frame >= step2Start ? "Step 2: Index Scan Substitution" : frame >= step1Start ? "Step 1: Predicate Pushdown" : "";
  const currentStepSpring = frame >= step3Start ? step3LabelSpring : frame >= step2Start ? step2LabelSpring : step1LabelSpring;

  const nodeWidth = 170;
  const nodeHeight = 48;

  const renderNode = (i: number) => {
    const label = getCurrentNodeLabel(i);
    if (!label) return null;
    const color = getCurrentNodeColor(i);
    const { px, py } = getAdjustedNodePos(i);
    const s = nodeSprings[i];
    const scale = interpolate(s, [0, 1], [0.4, 1]);

    const isBeingScanned = scanOpacity > 0 && Math.abs(scanY - py) < 40;
    const scanHighlight = isBeingScanned ? 1.08 : 1;

    let extraTransformX = 0;
    let extraTransformY = 0;
    if (i === 4 && shakeActive) { extraTransformX = shakeX; extraTransformY = shakeY; }
    if (i === 2 && joinShakeActive) { extraTransformX = joinShakeX; }

    const cost = getCurrentNodeCost(i);
    const costSpringVal = costSprings[i];

    const isOptimized = (i === 4 && indexSwap > 0.5) || (i === 2 && hashJoinSwap > 0.5) || ((i === 0 || i === 3) && hashJoinSwap > 0.5);

    return (
      <div key={i} style={{
        position: "absolute",
        left: px - nodeWidth / 2 + extraTransformX,
        top: py - nodeHeight / 2 + extraTransformY,
        width: nodeWidth,
        opacity: s,
        transform: `scale(${scale * scanHighlight})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        zIndex: 10,
      }}>
        <div style={{
          ...glass,
          padding: "10px 16px",
          borderRadius: 12,
          borderLeft: `4px solid ${color}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          justifyContent: "center",
          boxShadow: isOptimized ? `0 0 ${16 * glowPulse}px ${color}40` : glass.boxShadow,
        }}>
          {i === 4 && indexSwap > 0.5 && <Zap size={14} color={colors.primary} style={{ opacity: indexSwap }} />}
          <span style={{
            fontFamily: inter,
            fontSize: 13,
            fontWeight: 700,
            color: colors.foreground,
            whiteSpace: "nowrap",
          }}>{label}</span>
        </div>
        <div style={{
          opacity: costSpringVal,
          fontFamily: "'SF Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: isOptimized ? colors.success : color,
          padding: "2px 8px",
          borderRadius: 6,
          background: isOptimized ? `${colors.success}15` : `${color}15`,
        }}>
          cost={Math.round(cost)}
        </div>
      </div>
    );
  };

  const renderConnector = (parentIdx: number, childIdx: number, connIdx: number) => {
    const parentLabel = getCurrentNodeLabel(parentIdx);
    const childLabel = getCurrentNodeLabel(childIdx);
    if (!parentLabel || !childLabel) return null;

    const parentPos = getAdjustedNodePos(parentIdx);
    const childPos = getAdjustedNodePos(childIdx);
    const s = connectorSprings[connIdx];

    const x1 = parentPos.px;
    const y1 = parentPos.py + nodeHeight / 2 + 12;
    const x2 = childPos.px;
    const y2 = childPos.py - nodeHeight / 2 + 4;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const dashOffset = interpolate(s, [0, 1], [length, 0]);

    return (
      <line
        key={`${parentIdx}-${childIdx}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colors.border}
        strokeWidth={2}
        strokeDasharray={length}
        strokeDashoffset={dashOffset}
      />
    );
  };

  const filterMerged = predicatePushdown > 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden", fontFamily: inter }}>
      <div style={{ position: "absolute", inset: 0, ...gridBg, opacity: 0.3 }} />

      <div style={{
        position: "absolute",
        top: 24,
        left: 40,
        opacity: phaseLabelSpring,
        zIndex: 20,
      }}>
        <div style={{
          fontFamily: montserrat,
          fontSize: 14,
          fontWeight: 900,
          color: colors.primary,
          letterSpacing: 4,
          textTransform: "uppercase",
          padding: "6px 16px",
          borderRadius: 8,
          background: `${colors.primary}10`,
          border: `1px solid ${colors.primary}30`,
        }}>
          {phase}
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: `translateX(-50%) translateY(${sqlCardY}px)`,
        opacity: sqlCardSpring,
        zIndex: 15,
        width: 900,
      }}>
        <div style={{
          ...glass,
          padding: "16px 28px",
          borderTop: `3px solid ${colors.accent}`,
        }}>
          <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>SQL Query</div>
          <div style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 14,
            fontWeight: 500,
            color: colors.foreground,
            lineHeight: 1.6,
            wordBreak: "break-all",
          }}>
            {sqlText.slice(0, charsVisible)}
            {charsVisible < sqlText.length && (
              <span style={{ color: colors.primary, opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0 }}>|</span>
            )}
          </div>
        </div>
      </div>

      {showNaiveTree && (
        <>
          <svg style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }} width={1920} height={1080}>
            {naiveNodes.map((node, i) => {
              if (!node.children) return null;
              return node.children.map((childIdx) => {
                if (i === 1 && filterMerged) return null;
                if (i === 0 && childIdx === 1 && filterMerged) {
                  return renderConnector(0, 2, 1);
                }
                return renderConnector(i, childIdx, i);
              });
            })}
            {filterMerged && (
              <>
                {renderConnector(2, 3, 3)}
                {renderConnector(2, 4, 4)}
              </>
            )}
            {!filterMerged && naiveNodes[2].children && naiveNodes[2].children.map((childIdx) => renderConnector(2, childIdx, childIdx))}
          </svg>

          {naiveNodes.map((_, i) => {
            if (i === 1 && filterMerged) return null;
            return renderNode(i);
          })}
          {!filterMerged && renderNode(1)}

          {scanOpacity > 0 && (
            <div style={{
              position: "absolute",
              left: treeBaseX - 200,
              top: scanY - 2,
              width: 400,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
              opacity: scanOpacity * 0.8,
              zIndex: 12,
              boxShadow: `0 0 20px ${colors.primary}60`,
              borderRadius: 2,
            }} />
          )}

          {currentStepLabel && frame >= step1Start && (
            <div style={{
              position: "absolute",
              bottom: 80,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 20,
              opacity: currentStepSpring,
              transform: `translateX(${interpolate(currentStepSpring, [0, 1], [-60, 0])}px)`,
            }}>
              <div style={{
                ...glass,
                padding: "12px 32px",
                borderLeft: `4px solid ${colors.primary}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <Search size={18} color={colors.primary} />
                <span style={{
                  fontFamily: montserrat,
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.foreground,
                }}>{currentStepLabel}</span>
              </div>
            </div>
          )}
        </>
      )}

      {showComparison && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 15,
          gap: 36,
        }}>
          <div style={{
            opacity: compSpring,
            transform: `translateX(${compSlideX}px)`,
            width: 700,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            <div style={{
              fontFamily: montserrat,
              fontSize: 22,
              fontWeight: 700,
              color: colors.foreground,
              textAlign: "center",
              marginBottom: 8,
            }}>Query Execution Cost</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: colors.mutedForeground, width: 60, textAlign: "right" }}>Before</span>
                <div style={{ flex: 1, height: 40, background: colors.muted, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${barBeforeFill * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${colors.destructive}, ${colors.warning})`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 12,
                  }}>
                    {barBeforeFill > 0.3 && (
                      <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.white }}>12,400</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: colors.mutedForeground, width: 60, textAlign: "right" }}>After</span>
                <div style={{ flex: 1, height: 40, background: colors.muted, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${barAfterFill * 7}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${colors.success}, ${colors.primaryLight})`,
                    borderRadius: 10,
                    minWidth: barAfterFill > 0 ? 80 : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 12,
                  }}>
                    {barAfterFill > 0.3 && (
                      <span style={{ fontFamily: montserrat, fontSize: 16, fontWeight: 900, color: colors.white }}>870</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            opacity: speedupSpring,
            transform: `scale(${speedupScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{
              fontFamily: montserrat,
              fontSize: 72,
              fontWeight: 900,
              color: colors.primary,
              textShadow: `0 0 ${30 * glowPulse}px ${colors.primary}50`,
              lineHeight: 1,
            }}>
              14.2x faster
            </div>
            <div style={{
              fontFamily: inter,
              fontSize: 16,
              fontWeight: 600,
              color: colors.mutedForeground,
            }}>
              Query optimizer transformed the execution plan
            </div>
          </div>
        </div>
      )}

      {showComparison && (
        <div style={{
          position: "absolute",
          top: 84,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 16,
          display: "flex",
          gap: 12,
          opacity: compSpring,
        }}>
          <div style={{
            ...glass,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: `3px solid ${colors.success}`,
          }}>
            <ArrowDown size={14} color={colors.success} style={{ transform: "rotate(180deg)" }} />
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.success }}>Predicate Pushdown</span>
          </div>
          <div style={{
            ...glass,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: `3px solid ${colors.primary}`,
          }}>
            <Zap size={14} color={colors.primary} />
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.primary }}>Index Scan</span>
          </div>
          <div style={{
            ...glass,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: `3px solid ${colors.accent}`,
          }}>
            <Search size={14} color={colors.accent} />
            <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: colors.accent }}>Hash Join</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};