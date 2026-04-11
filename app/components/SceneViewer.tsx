"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RemotionPreview } from "./RemotionPreview";
import { CodeBlock } from "./CodeBlock";
import {
  SpinnerGap,
  FilmStrip,
  DownloadSimple,
} from "@phosphor-icons/react";

interface SceneViewerProps {
  sceneName: string;
  durationInFrames: number;
  fps: number;
  videoId?: string;
  videoName?: string;
  description?: string;
}

export function SceneViewer({
  sceneName,
  durationInFrames,
  fps,
  videoName,
  description,
}: SceneViewerProps) {
  const [code, setCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ file: string; sizeMB: string } | null>(null);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    setCode(null);
    setRenderResult(null);
    setRenderError("");
  }, [sceneName]);

  const loadCode = async () => {
    setCodeLoading(true);
    try {
      const res = await fetch(`/api/scene-code?name=${encodeURIComponent(sceneName)}`);
      const data = await res.json();
      if (res.ok) setCode(data.code);
    } catch {} finally {
      setCodeLoading(false);
    }
  };

  const handleRender = async () => {
    setRendering(true);
    setRenderError("");
    setRenderResult(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: sceneName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRenderResult({ file: data.file, sizeMB: data.sizeMB });
    } catch (err: unknown) {
      setRenderError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold font-mono">{sceneName}</h2>
          {videoName && (
            <Badge variant="secondary" className="text-[10px]">{videoName}</Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="font-mono text-xs">
            {Math.round(durationInFrames / fps)}s
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {fps}fps
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {durationInFrames} frames
          </Badge>
        </div>
      </div>

      {/* Preview */}
      <RemotionPreview
        key={sceneName}
        sceneName={sceneName}
        durationInFrames={durationInFrames}
        fps={fps}
      />

      {/* Render */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Render to MP4</p>
              <p className="text-xs text-muted-foreground mt-0.5">1080p, {fps}fps</p>
            </div>
            <div className="flex items-center gap-2">
              {renderResult && (
                <a href={renderResult.file} download>
                  <Button variant="outline" size="sm">
                    <DownloadSimple size={14} weight="bold" />
                    Download ({renderResult.sizeMB} MB)
                  </Button>
                </a>
              )}
              <Button size="sm" onClick={handleRender} disabled={rendering}>
                {rendering ? (
                  <>
                    <SpinnerGap size={14} className="animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    <FilmStrip size={14} weight="bold" />
                    {renderResult ? "Re-render" : "Render"}
                  </>
                )}
              </Button>
            </div>
          </div>
          {renderError && (
            <p className="text-xs text-destructive mt-2">{renderError}</p>
          )}
        </CardContent>
      </Card>

      {/* Code */}
      {code === null ? (
        <Button variant="outline" size="sm" onClick={loadCode} disabled={codeLoading}>
          {codeLoading ? (
            <>
              <SpinnerGap size={14} className="animate-spin" />
              Loading...
            </>
          ) : (
            "View Source Code"
          )}
        </Button>
      ) : (
        <details open>
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
            Source ({code.split("\n").length} lines)
          </summary>
          <CodeBlock code={code} />
        </details>
      )}
    </div>
  );
}
