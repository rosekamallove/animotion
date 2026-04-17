"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkle, FilmSlate, FilmReel, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./components/Sidebar";
import { SceneCreator } from "./components/SceneCreator";
import { ChatCreator } from "./components/ChatCreator";
import { SceneViewer } from "./components/SceneViewer";
import { VideoOverview } from "./components/VideoOverview";

type StylePreset = "professional" | "playful" | "standard";

interface SceneData {
  name: string;
  description: string;
  duration: number;
  fps: number;
}

interface VideoData {
  id: string;
  name: string;
  style: StylePreset;
  script: string;
  createdAt: string;
  scenes: SceneData[];
}

interface VideosResponse {
  videos: VideoData[];
  standalone: SceneData[];
}

type View =
  | { type: "welcome" }
  | { type: "video"; videoId: string }
  | { type: "scene"; sceneName: string; videoId?: string }
  | { type: "creator"; videoId?: string; mode?: "chat" | "stepper" };

export default function Home() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [standalone, setStandalone] = useState<SceneData[]>([]);
  const [view, setView] = useState<View>({ type: "welcome" });
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch("/api/videos");
      const data: VideosResponse = await res.json();
      setVideos(data.videos || []);
      setStandalone(data.standalone || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleNewVideo = async (name: string, style: StylePreset) => {
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, style }),
      });
      if (res.ok) {
        const video: VideoData = await res.json();
        await fetchVideos();
        setView({ type: "video", videoId: video.id });
      }
    } catch {}
  };

  const handleUpdateScript = async (videoId: string, script: string) => {
    await fetch("/api/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, script }),
    });
    await fetchVideos();
  };

  const handleSceneComplete = async () => {
    await fetchVideos();
  };

  // Find scene data across videos and standalone
  const findScene = (sceneName: string, videoId?: string): { scene: SceneData; video?: VideoData } | null => {
    if (videoId) {
      const video = videos.find((v) => v.id === videoId);
      const scene = video?.scenes.find((s) => s.name === sceneName);
      if (video && scene) return { scene, video };
    }
    for (const v of videos) {
      const scene = v.scenes.find((s) => s.name === sceneName);
      if (scene) return { scene, video: v };
    }
    const scene = standalone.find((s) => s.name === sceneName);
    if (scene) return { scene };
    return null;
  };

  const findVideo = (videoId: string) => videos.find((v) => v.id === videoId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        videos={videos}
        standalone={standalone}
        selectedView={view}
        onSelectVideo={(videoId) => setView({ type: "video", videoId })}
        onSelectScene={(sceneName, videoId) => setView({ type: "scene", sceneName, videoId })}
        onNewScene={(videoId) => setView({ type: "creator", videoId })}
        onNewVideo={handleNewVideo}
        onHome={() => setView({ type: "welcome" })}
      />

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] w-full px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
            </div>
          ) : (
            <>
              {/* Welcome */}
              {view.type === "welcome" && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkle size={32} weight="fill" className="text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Welcome to Animotion</h1>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Describe an animation in plain English and get a production-ready Remotion scene.
                    Create videos to build related scenes with shared design language and narrative context.
                  </p>
                  <div className="flex gap-3">
                    <Button size="lg" onClick={() => setView({ type: "creator" })}>
                      <Plus size={16} />
                      New Scene
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => {
                      setView({ type: "creator" });
                    }}>
                      <FilmReel size={16} />
                      New Video
                    </Button>
                  </div>

                  {/* Quick access to recent scenes */}
                  {(videos.length > 0 || standalone.length > 0) && (
                    <div className="mt-12 w-full max-w-lg">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-left">
                        Recent
                      </p>
                      <div className="space-y-2">
                        {videos.flatMap((v) =>
                          v.scenes.slice(-2).map((s) => (
                            <button
                              key={s.name}
                              onClick={() => setView({ type: "scene", sceneName: s.name, videoId: v.id })}
                              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all text-left"
                            >
                              <FilmSlate size={16} className="text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <code className="text-xs font-semibold font-mono">{s.name}</code>
                                {s.description && (
                                  <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground shrink-0">{v.name}</span>
                            </button>
                          ))
                        )}
                        {standalone.slice(-3).map((s) => (
                          <button
                            key={s.name}
                            onClick={() => setView({ type: "scene", sceneName: s.name })}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all text-left"
                          >
                            <FilmSlate size={16} className="text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <code className="text-xs font-semibold font-mono">{s.name}</code>
                              {s.description && (
                                <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Overview */}
              {view.type === "video" && (() => {
                const video = findVideo(view.videoId);
                if (!video) return <p className="text-muted-foreground">Video not found.</p>;
                return (
                  <VideoOverview
                    key={video.id}
                    id={video.id}
                    name={video.name}
                    style={video.style}
                    script={video.script}
                    scenes={video.scenes}
                    onSelectScene={(name) => setView({ type: "scene", sceneName: name, videoId: video.id })}
                    onNewScene={() => setView({ type: "creator", videoId: video.id })}
                    onUpdateScript={(script) => handleUpdateScript(video.id, script)}
                  />
                );
              })()}

              {/* Scene Viewer */}
              {view.type === "scene" && (() => {
                const found = findScene(view.sceneName, view.videoId);
                if (!found) return <p className="text-muted-foreground">Scene not found.</p>;
                return (
                  <SceneViewer
                    sceneName={found.scene.name}
                    durationInFrames={found.scene.duration}
                    fps={found.scene.fps}
                    videoId={found.video?.id}
                    videoName={found.video?.name}
                    description={found.scene.description}
                  />
                );
              })()}

              {/* Scene Creator */}
              {view.type === "creator" && (() => {
                const video = view.videoId ? findVideo(view.videoId) : undefined;
                const mode = view.mode ?? "chat";
                const back = () => {
                  if (video) setView({ type: "video", videoId: video.id });
                  else setView({ type: "welcome" });
                };
                const toggleMode = () =>
                  setView({
                    type: "creator",
                    videoId: view.videoId,
                    mode: mode === "chat" ? "stepper" : "chat",
                  });

                return (
                  <div>
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={toggleMode}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        {mode === "chat" ? "Use classic stepper instead" : "Back to chat mode"}
                      </button>
                    </div>
                    {mode === "chat" ? (
                      <ChatCreator
                        key={view.videoId || "standalone"}
                        videoId={video?.id}
                        videoName={video?.name}
                        videoStyle={video?.style}
                        videoScript={video?.script}
                        onComplete={handleSceneComplete}
                        onBack={back}
                      />
                    ) : (
                      <SceneCreator
                        key={view.videoId || "standalone"}
                        videoId={video?.id}
                        videoName={video?.name}
                        videoStyle={video?.style}
                        onComplete={handleSceneComplete}
                        onBack={back}
                      />
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
