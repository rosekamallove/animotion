"use client";

import React, { useState, useCallback } from "react";
import { Player } from "@remotion/player";

interface RemotionPreviewProps {
  sceneName: string;
  durationInFrames: number;
  fps: number;
}

export function RemotionPreview({ sceneName, durationInFrames, fps }: RemotionPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  // Generated components use named exports (export const SceneName = ...)
  // Player's lazyComponent expects { default: Component }, so we remap
  // Import from the auto-generated registry (static path — Turbopack can resolve it)
  // The registry re-exports all generated components by name
  const lazyComponent = useCallback(
    () =>
      import("@generated/_registry")
        .then((mod: Record<string, React.FC>) => {
          if (!mod[sceneName]) throw new Error(`Component "${sceneName}" not found in registry`);
          return { default: mod[sceneName] };
        })
        .catch((err: Error) => {
          setError(err.message);
          throw err;
        }),
    [sceneName]
  );

  if (error) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Preview unavailable</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        <div className="rounded-md border bg-background p-3 font-mono text-xs text-muted-foreground whitespace-pre text-left inline-block">
          cd remotion{"\n"}npx remotion studio
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Select <strong className="text-primary">{sceneName}</strong> from the Generated folder.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <Player
        lazyComponent={lazyComponent}
        durationInFrames={durationInFrames}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={fps}
        controls
        loop
        autoPlay
        style={{ width: "100%" }}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
