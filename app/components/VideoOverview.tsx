"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FilmReel,
  FilmSlate,
  Plus,
  FloppyDisk,
  SpinnerGap,
  Scroll,
} from "@phosphor-icons/react";

type StylePreset = "professional" | "playful" | "standard";

const styleMeta: Record<StylePreset, { label: string; color: string }> = {
  professional: { label: "Professional", color: "#2563eb" },
  playful: { label: "Playful", color: "#ec4899" },
  standard: { label: "Standard", color: "#00d4ff" },
};

interface VideoScene {
  name: string;
  description: string;
  duration: number;
  fps: number;
}

interface VideoOverviewProps {
  id: string;
  name: string;
  style: StylePreset;
  script: string;
  scenes: VideoScene[];
  onSelectScene: (sceneName: string) => void;
  onNewScene: () => void;
  onUpdateScript: (script: string) => Promise<void>;
}

export function VideoOverview({
  id,
  name,
  style,
  script: initialScript,
  scenes,
  onSelectScene,
  onNewScene,
  onUpdateScript,
}: VideoOverviewProps) {
  const [script, setScript] = useState(initialScript);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when video changes
  useEffect(() => {
    setScript(initialScript);
    setDirty(false);
  }, [id, initialScript]);

  const handleScriptChange = (value: string) => {
    setScript(value);
    setDirty(true);

    // Auto-save after 1.5s of inactivity
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveScript(value);
    }, 1500);
  };

  const saveScript = async (value: string) => {
    setSaving(true);
    try {
      await onUpdateScript(value);
      setDirty(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleSaveNow = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveScript(script);
  };

  const meta = styleMeta[style];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: meta.color + "15" }}
          >
            <FilmReel size={20} weight="fill" style={{ color: meta.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: meta.color + "40", color: meta.color }}
              >
                {meta.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <Button size="sm" onClick={onNewScene}>
          <Plus size={14} />
          New Scene
        </Button>
      </div>

      {/* Script Editor */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scroll size={14} /> Video Script
            </Label>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <SpinnerGap size={10} className="animate-spin" /> Saving...
                </span>
              )}
              {dirty && !saving && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={handleSaveNow}>
                  <FloppyDisk size={12} />
                  Save
                </Button>
              )}
              {!dirty && !saving && script && (
                <span className="text-[10px] text-muted-foreground">Saved</span>
              )}
            </div>
          </div>
          <Textarea
            value={script}
            onChange={(e) => handleScriptChange(e.target.value)}
            placeholder={`Write your full video script or narrative here...\n\nExample:\n"This video explains how neural networks process text in 5 scenes:\n1. Show tokens being split from a sentence\n2. Embeddings — each token becomes a vector\n3. Attention mechanism — tokens look at each other\n4. Feed-forward layers transform representations\n5. Final output — probability distribution over vocabulary"\n\nThis script will be included as context when generating each scene, so every scene knows the full story.`}
            className="min-h-[180px] resize-y text-sm leading-relaxed"
          />
          <p className="text-[11px] text-muted-foreground">
            The script is injected into every scene&apos;s generation context, so Claude knows where each scene fits in the narrative.
          </p>
        </CardContent>
      </Card>

      {/* Scene List */}
      {scenes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FilmSlate size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">No scenes yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first scene in this video. All scenes will share the {meta.label.toLowerCase()} style
              {script ? " and use your script for context" : ""}.
            </p>
            <Button size="sm" onClick={onNewScene}>
              <Plus size={14} />
              Create First Scene
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Scenes
          </p>
          <div className="grid gap-3">
            {scenes.map((scene) => (
              <button
                key={scene.name}
                onClick={() => onSelectScene(scene.name)}
                className="w-full text-left rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <FilmSlate size={16} style={{ color: meta.color }} />
                    <code className="text-sm font-semibold font-mono">{scene.name}</code>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {Math.round(scene.duration / scene.fps)}s
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {scene.fps}fps
                    </Badge>
                  </div>
                </div>
                {scene.description && (
                  <p className="text-xs text-muted-foreground mt-2 pl-[30px]">{scene.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
