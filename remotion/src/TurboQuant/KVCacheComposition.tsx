import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { KVPairVisual } from "./scenes/KVPairVisual";
import { PromptToKV } from "./scenes/PromptToKV";

/*
 * KV Cache Explainer — 2 scenes, 15 seconds
 *
 * Scene 1 (KVPairVisual):  150f  [00:00 - 00:05]
 * Scene 2 (PromptToKV):    300f  [00:05 - 00:15]
 *
 * Total: 450f = 15s
 */

export const KVCacheComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Sequence from={0} durationInFrames={150}>
        <KVPairVisual />
      </Sequence>
      <Sequence from={150} durationInFrames={300}>
        <PromptToKV />
      </Sequence>
    </AbsoluteFill>
  );
};
