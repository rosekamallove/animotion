import fs from "fs";
import path from "path";
import { StylePreset } from "./styles";

const REMOTION_ROOT = path.resolve(process.cwd(), "remotion");
const GENERATED_DIR = path.join(REMOTION_ROOT, "src", "generated");
const VIDEOS_PATH = path.join(GENERATED_DIR, "videos.json");

// --- Types ---

export interface VideoScene {
  name: string;
  file: string;
  description: string;
  duration: number;
  fps: number;
  createdAt: string;
}

export interface Video {
  id: string;
  name: string;
  style: StylePreset;
  script: string;
  createdAt: string;
  scenes: VideoScene[];
}

export interface VideosData {
  videos: Video[];
  standalone: VideoScene[];
}

// --- Read / Write ---

function ensureGeneratedDir() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

export function readVideos(): VideosData {
  // Migrate from groups.json if it exists and videos.json doesn't
  const legacyPath = path.join(GENERATED_DIR, "groups.json");
  if (!fs.existsSync(VIDEOS_PATH) && fs.existsSync(legacyPath)) {
    const legacy = JSON.parse(fs.readFileSync(legacyPath, "utf-8"));
    const migrated: VideosData = {
      videos: (legacy.groups || []).map((g: Record<string, unknown>) => ({
        ...g,
        script: "",
      })),
      standalone: legacy.standalone || [],
    };
    writeVideos(migrated);
    return migrated;
  }

  if (!fs.existsSync(VIDEOS_PATH)) {
    return { videos: [], standalone: [] };
  }
  return JSON.parse(fs.readFileSync(VIDEOS_PATH, "utf-8"));
}

export function writeVideos(data: VideosData) {
  ensureGeneratedDir();
  fs.writeFileSync(VIDEOS_PATH, JSON.stringify(data, null, 2));
}

// --- Helpers ---

function toId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- CRUD ---

export function createVideo(name: string, style: StylePreset): Video {
  const data = readVideos();
  const id = toId(name);

  if (data.videos.some((v) => v.id === id)) {
    throw new Error(`Video "${name}" already exists`);
  }

  const video: Video = {
    id,
    name,
    style,
    script: "",
    createdAt: new Date().toISOString(),
    scenes: [],
  };

  data.videos.push(video);
  writeVideos(data);
  return video;
}

export function getVideo(videoId: string): Video | undefined {
  const data = readVideos();
  return data.videos.find((v) => v.id === videoId);
}

export function updateVideoScript(videoId: string, script: string): Video {
  const data = readVideos();
  const video = data.videos.find((v) => v.id === videoId);
  if (!video) throw new Error(`Video "${videoId}" not found`);

  video.script = script;
  writeVideos(data);
  return video;
}

export function deleteVideo(videoId: string): void {
  const data = readVideos();
  const idx = data.videos.findIndex((v) => v.id === videoId);
  if (idx < 0) throw new Error(`Video "${videoId}" not found`);

  // Move scenes to standalone
  data.standalone.push(...data.videos[idx].scenes);
  data.videos.splice(idx, 1);
  writeVideos(data);
}

export function addSceneToVideo(
  videoId: string,
  scene: VideoScene
): void {
  const data = readVideos();
  const video = data.videos.find((v) => v.id === videoId);
  if (!video) throw new Error(`Video "${videoId}" not found`);

  const existingIdx = video.scenes.findIndex((s) => s.name === scene.name);
  if (existingIdx >= 0) {
    video.scenes[existingIdx] = scene;
  } else {
    video.scenes.push(scene);
  }
  writeVideos(data);
}

export function addStandaloneScene(scene: VideoScene): void {
  const data = readVideos();
  const existingIdx = data.standalone.findIndex((s) => s.name === scene.name);
  if (existingIdx >= 0) {
    data.standalone[existingIdx] = scene;
  } else {
    data.standalone.push(scene);
  }
  writeVideos(data);
}

// --- Context Reader (Rolling Window) ---

export interface VideoContext {
  videoName: string;
  style: StylePreset;
  script: string;
  /** Full TSX source for recent scenes (N-1, N-2) */
  recentScenes: Array<{ name: string; code: string }>;
  /** Name + description only for older scenes */
  olderScenes: Array<{ name: string; description: string }>;
}

function readSceneCode(sceneName: string): string | null {
  const filePath = path.join(GENERATED_DIR, `${sceneName}.tsx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getVideoContext(videoId: string): VideoContext | null {
  const video = getVideo(videoId);
  if (!video) return null;

  const scenes = video.scenes;
  const recentScenes: VideoContext["recentScenes"] = [];
  const olderScenes: VideoContext["olderScenes"] = [];

  // Last 2 scenes get full code, older ones get summaries
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (i >= scenes.length - 2) {
      const code = readSceneCode(scene.name);
      if (code) {
        recentScenes.push({ name: scene.name, code });
      } else {
        olderScenes.push({ name: scene.name, description: scene.description });
      }
    } else {
      olderScenes.push({ name: scene.name, description: scene.description });
    }
  }

  return {
    videoName: video.name,
    style: video.style,
    script: video.script,
    recentScenes,
    olderScenes,
  };
}

export function formatVideoContext(ctx: VideoContext): string {
  const parts: string[] = [
    `## VIDEO CONTEXT`,
    `Video: "${ctx.videoName}" (style: ${ctx.style})`,
    `This scene belongs to a video — a series of related animations. Match the design language, color usage, animation feel, and visual patterns from previous scenes.`,
  ];

  if (ctx.script) {
    parts.push(
      `\n### Video Script`,
      `The following is the full script/narrative for this video. Use it to understand the broader story and ensure this scene fits naturally into the sequence:`,
      `\n${ctx.script}`
    );
  }

  if (ctx.olderScenes.length > 0) {
    parts.push(
      `\n### Earlier scenes in this video (summaries):`,
      ...ctx.olderScenes.map(
        (s) => `- **${s.name}**: ${s.description}`
      )
    );
  }

  if (ctx.recentScenes.length > 0) {
    parts.push(`\n### Recent scenes (full code — match this style closely):`);
    for (const s of ctx.recentScenes) {
      parts.push(`\n#### ${s.name}\n\`\`\`tsx\n${s.code}\n\`\`\``);
    }
  }

  return parts.join("\n");
}
