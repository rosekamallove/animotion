"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkle,
  FilmReel,
  FilmSlate,
  Plus,
  CaretDown,
  CaretRight,
  X,
} from "@phosphor-icons/react";

type StylePreset = "professional" | "playful" | "standard";

interface SidebarScene {
  name: string;
  description: string;
  duration: number;
  fps: number;
}

interface SidebarVideo {
  id: string;
  name: string;
  style: StylePreset;
  scenes: SidebarScene[];
}

interface SidebarProps {
  videos: SidebarVideo[];
  standalone: SidebarScene[];
  selectedView: { type: "welcome" } | { type: "video"; videoId: string } | { type: "scene"; sceneName: string; videoId?: string } | { type: "creator"; videoId?: string };
  onSelectVideo: (videoId: string) => void;
  onSelectScene: (sceneName: string, videoId?: string) => void;
  onNewScene: (videoId?: string) => void;
  onNewVideo: (name: string, style: StylePreset) => void;
  onHome: () => void;
}

const styleColors: Record<StylePreset, string> = {
  professional: "#2563eb",
  playful: "#ec4899",
  standard: "#00d4ff",
};

export function Sidebar({
  videos,
  standalone,
  selectedView,
  onSelectVideo,
  onSelectScene,
  onNewScene,
  onNewVideo,
  onHome,
}: SidebarProps) {
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(
    new Set(videos.map((v) => v.id))
  );
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [newVideoName, setNewVideoName] = useState("");
  const [newVideoStyle, setNewVideoStyle] = useState<StylePreset>("standard");

  const toggleVideo = (videoId: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const handleCreateVideo = () => {
    if (!newVideoName.trim()) return;
    onNewVideo(newVideoName.trim(), newVideoStyle);
    setNewVideoName("");
    setNewVideoStyle("standard");
    setShowNewVideo(false);
  };

  const isSceneSelected = (sceneName: string) =>
    selectedView.type === "scene" && selectedView.sceneName === sceneName;

  const isVideoSelected = (videoId: string) =>
    selectedView.type === "video" && selectedView.videoId === videoId;

  return (
    <aside className="w-[280px] shrink-0 border-r bg-muted/30 flex flex-col h-screen">
      {/* Logo / Home */}
      <button
        onClick={onHome}
        className="flex items-center gap-2.5 px-4 py-4 border-b hover:bg-muted/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/25">
          <Sparkle size={16} weight="fill" className="text-primary-foreground" />
        </div>
        <div className="text-left">
          <h1 className="text-sm font-bold tracking-tight">Animotion</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">AI Animation Generator</p>
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Videos */}
        {videos.map((video) => (
          <div key={video.id} className="mb-1">
            {/* Video Header */}
            <button
              onClick={() => toggleVideo(video.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors rounded-md mx-1 ${
                isVideoSelected(video.id) ? "bg-muted" : ""
              }`}
              style={{ width: "calc(100% - 8px)" }}
            >
              {expandedVideos.has(video.id) ? (
                <CaretDown size={12} className="text-muted-foreground shrink-0" />
              ) : (
                <CaretRight size={12} className="text-muted-foreground shrink-0" />
              )}
              <FilmReel size={16} weight="fill" style={{ color: styleColors[video.style] }} className="shrink-0" />
              <span className="text-sm font-medium truncate flex-1">{video.name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">
                {video.scenes.length}
              </Badge>
            </button>

            {/* Video Scenes */}
            {expandedVideos.has(video.id) && (
              <div className="ml-5 pl-2 border-l border-border/50">
                {video.scenes.map((scene) => (
                  <button
                    key={scene.name}
                    onClick={() => onSelectScene(scene.name, video.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-md transition-colors ${
                      isSceneSelected(scene.name)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <FilmSlate size={13} className="shrink-0" />
                    <span className="text-xs truncate">{scene.name}</span>
                  </button>
                ))}
                {/* + New Scene in video */}
                <button
                  onClick={() => onNewScene(video.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  <Plus size={13} className="shrink-0" />
                  <span className="text-xs">New Scene</span>
                </button>
                {/* Video overview link */}
                <button
                  onClick={() => onSelectVideo(video.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-md transition-colors ${
                    isVideoSelected(video.id)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <FilmReel size={13} className="shrink-0" />
                  <span className="text-xs">Overview</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Standalone Scenes */}
        {standalone.length > 0 && (
          <div className="mb-1">
            <div className="px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Standalone
              </span>
            </div>
            <div className="px-1">
              {standalone.map((scene) => (
                <button
                  key={scene.name}
                  onClick={() => onSelectScene(scene.name)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md transition-colors ${
                    isSceneSelected(scene.name)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <FilmSlate size={14} className="shrink-0" />
                  <span className="text-xs truncate">{scene.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t p-3 space-y-2">
        {showNewVideo ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">New Video</span>
              <button onClick={() => setShowNewVideo(false)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <Input
              value={newVideoName}
              onChange={(e) => setNewVideoName(e.target.value)}
              placeholder="Video name..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleCreateVideo()}
              autoFocus
            />
            <Select value={newVideoStyle} onValueChange={(v) => setNewVideoStyle(v as StylePreset)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="w-full h-7 text-xs" onClick={handleCreateVideo} disabled={!newVideoName.trim()}>
              Create Video
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setShowNewVideo(true)}
            >
              <Plus size={12} />
              New Video
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onNewScene()}
            >
              <Plus size={12} />
              New Scene
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
