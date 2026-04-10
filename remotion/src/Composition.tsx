import React from "react";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { LightLeak } from "@remotion/light-leaks";
import { FlyingTickets } from "./scenes/FlyingTickets";
import { LogoDashboard } from "./scenes/LogoDashboard";
import { BoldStatement } from "./scenes/BoldStatement";
import { ChatInterface } from "./scenes/ChatInterface";
import { GapFinder } from "./scenes/GapFinder";
import { HelpdeskLogos } from "./scenes/HelpdeskLogos";
import { ActionCards } from "./scenes/ActionCards";
import { EscalationResolved } from "./scenes/EscalationResolved";
import { FinalCTA } from "./scenes/FinalCTA";

/*
 * Scene timing (30fps, 79 seconds = 2370 frames):
 *
 * Scene 1 (FlyingTickets):       150f  [00:00 - 00:05]
 * Transition (fade):              20f
 * Scene 2 (LogoDashboard):       170f  [00:06 - 00:10]
 * Transition (slide right):       20f
 * Scene 3 (BoldStatement):       170f  [00:11 - 00:15]
 * Transition (slide bottom):      20f
 * Scene 4 (ChatInterface):       320f  [00:16 - 00:25]
 * Transition (fade):              20f
 * Scene 5 (GapFinder):           400f  [00:26 - 00:38]
 * Overlay (light leak):           24f  (does not subtract)
 * Scene 6 (HelpdeskLogos):       200f  [00:39 - 00:44]
 * Transition (slide left):        20f
 * Scene 7 (ActionCards):         310f  [00:45 - 00:54]
 * Transition (fade):              20f
 * Scene 8 (EscalationResolved):  340f  [00:55 - 01:05]
 * Transition (fade):              20f
 * Scene 9 (FinalCTA):            430f  [01:06 - 01:19]
 *
 * Total scenes: 2490f
 * Total transitions: 7 × 20 = 140f subtracted
 * Overlay: 24f (not subtracted)
 * Effective duration: 2490 - 140 = 2350f ≈ 78.3s
 * (Composition durationInFrames set to 2370 to cover full audio)
 */

export const MyComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  const audioDuration = 79 * fps;

  return (
    <AbsoluteFill>
      {/* Background music */}
      <Audio
        src={staticFile("bg-music.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fps], [0, 0.7], {
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [audioDuration - 2 * fps, audioDuration],
            [0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      <TransitionSeries>
        {/* Scene 1 [00:00 - 00:05]: Flying Tickets */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <FlyingTickets />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2 [00:06 - 00:10]: Logo Reveal + Dashboard */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <LogoDashboard />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 3 [00:11 - 00:15]: Bold Statement - 65% + "You pay nothing" */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <BoldStatement />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 4 [00:16 - 00:25]: Chat Interface + AI solving + Mobile mockups */}
        <TransitionSeries.Sequence durationInFrames={320}>
          <ChatInterface />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5 [00:26 - 00:38]: Gap Finder + Analytics Dashboard */}
        <TransitionSeries.Sequence durationInFrames={400}>
          <GapFinder />
        </TransitionSeries.Sequence>

        {/* Light leak overlay into Helpdesk Logos */}
        <TransitionSeries.Overlay durationInFrames={24}>
          <LightLeak seed={3} hueShift={220} />
        </TransitionSeries.Overlay>

        {/* Scene 6 [00:39 - 00:44]: Helpdesk Logos orbiting */}
        <TransitionSeries.Sequence durationInFrames={200}>
          <HelpdeskLogos />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 7 [00:45 - 00:54]: Action Cards - "It acts" */}
        <TransitionSeries.Sequence durationInFrames={310}>
          <ActionCards />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 8 [00:55 - 01:05]: Escalation + Resolved stamps */}
        <TransitionSeries.Sequence durationInFrames={340}>
          <EscalationResolved />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 9 [01:06 - 01:19]: Final CTA + Logo + helply.com */}
        <TransitionSeries.Sequence durationInFrames={430}>
          <FinalCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
