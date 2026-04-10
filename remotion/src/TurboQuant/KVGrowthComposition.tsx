import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { KVCacheGrowth } from "./scenes/KVCacheGrowth";
import { KVCacheModelImpact } from "./scenes/KVCacheModelImpact";
import { VRAMSpillover } from "./scenes/VRAMSpillover";
import { DegradedOutput } from "./scenes/DegradedOutput";

/*
 * KV Cache Growth — 4 scenes, ~38 seconds
 *
 * Scene 1 (KVCacheGrowth):       300f  [00:00 - 00:10]  Line chart
 * Scene 2 (KVCacheModelImpact):  240f  [00:10 - 00:18]  8B vs 70B comparison
 * Scene 3 (VRAMSpillover):       300f  [00:18 - 00:28]  GPU → System RAM waterfall
 * Scene 4 (DegradedOutput):      300f  [00:28 - 00:38]  Terminal output degrading
 *
 * Total: 1140f = 38s
 */

export const KVGrowthComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Sequence from={0} durationInFrames={300}>
        <KVCacheGrowth />
      </Sequence>
      <Sequence from={300} durationInFrames={240}>
        <KVCacheModelImpact />
      </Sequence>
      <Sequence from={540} durationInFrames={300}>
        <VRAMSpillover />
      </Sequence>
      <Sequence from={840} durationInFrames={300}>
        <DegradedOutput />
      </Sequence>
    </AbsoluteFill>
  );
};
