import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroHook } from "./scenes/IntroHook";
import { MemoryWall } from "./scenes/MemoryWall";
import { TurboQuantReveal } from "./scenes/TurboQuantReveal";
import { PolarQuantExplainer } from "./scenes/PolarQuantExplainer";
import { QJLSafeguard } from "./scenes/QJLSafeguard";
import { RealWorldImpact } from "./scenes/RealWorldImpact";
import { Implementation } from "./scenes/Implementation";
import { Outro } from "./scenes/Outro";

/*
 * TurboQuant Explainer Video — 4K (3840×2160), 6 minutes
 * Scenes are authored at 1920×1080 and scaled 2× for 4K output.
 *
 * Scene timing (30fps, ~6 minutes):
 *
 * Scene 1 (IntroHook):           1150f  [00:00 - 00:38]
 * Transition (fade):               20f
 * Scene 2 (MemoryWall):          2000f  [00:39 - 01:45]
 * Transition (slide right):        20f
 * Scene 3 (TurboQuantReveal):    1150f  [01:46 - 02:24]
 * Transition (fade):               20f
 * Scene 4 (PolarQuantExplainer): 1750f  [02:25 - 03:23]
 * Transition (slide bottom):       20f
 * Scene 5 (QJLSafeguard):        1450f  [03:24 - 04:12]
 * Transition (fade):               20f
 * Scene 6 (RealWorldImpact):     1400f  [04:13 - 04:59]
 * Transition (slide left):         20f
 * Scene 7 (Implementation):      1150f  [05:00 - 05:38]
 * Transition (fade):               20f
 * Scene 8 (Outro):                850f  [05:39 - 06:07]
 *
 * Total scenes: 10900f
 * Total transitions: 7 × 20 = 140f subtracted
 * Effective duration: 10900 - 140 = 10760f ≈ 359s ≈ 5:59
 */

export const TurboQuantComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <TransitionSeries>
          {/* Scene 1: Intro Hook */}
          <TransitionSeries.Sequence durationInFrames={1150}>
            <IntroHook />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 20 })}
          />

          {/* Scene 2: The Memory Wall - KV Cache Problem */}
          <TransitionSeries.Sequence durationInFrames={2000}>
            <MemoryWall />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
          />

          {/* Scene 3: TurboQuant Reveal */}
          <TransitionSeries.Sequence durationInFrames={1150}>
            <TurboQuantReveal />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 20 })}
          />

          {/* Scene 4: Stage 1 - PolarQuant Explainer */}
          <TransitionSeries.Sequence durationInFrames={1750}>
            <PolarQuantExplainer />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({ direction: "from-bottom" })}
            timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
          />

          {/* Scene 5: Stage 2 - QJL Safeguard */}
          <TransitionSeries.Sequence durationInFrames={1450}>
            <QJLSafeguard />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 20 })}
          />

          {/* Scene 6: Real World Impact */}
          <TransitionSeries.Sequence durationInFrames={1400}>
            <RealWorldImpact />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({ direction: "from-left" })}
            timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
          />

          {/* Scene 7: Implementation Reality Check */}
          <TransitionSeries.Sequence durationInFrames={1150}>
            <Implementation />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: 20 })}
          />

          {/* Scene 8: Outro */}
          <TransitionSeries.Sequence durationInFrames={850}>
            <Outro />
          </TransitionSeries.Sequence>
        </TransitionSeries>
    </AbsoluteFill>
  );
};
