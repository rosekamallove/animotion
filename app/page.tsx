"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RemotionPreview } from "./components/RemotionPreview";
import { CodeBlock } from "./components/CodeBlock";
import {
  SpinnerGap,
  CheckCircle,
  Warning,
  ArrowRight,
  Palette,
  Timer,
  Play,
  FileTsx,
  Sparkle,
  FilmStrip,
  DownloadSimple,
} from "@phosphor-icons/react";

type AppState = "idle" | "planning" | "reviewing" | "generating" | "writing" | "done" | "error";
type StylePreset = "professional" | "playful" | "standard";

const styleOptions: Array<{
  id: StylePreset;
  name: string;
  tagline: string;
  traits: string[];
  colors: { bg: string; primary: string; accent: string; text: string };
}> = [
  {
    id: "professional",
    name: "Professional",
    tagline: "Clean, corporate, data-focused",
    traits: ["Smooth fades", "No bounce", "Subtle shadows"],
    colors: { bg: "#ffffff", primary: "#2563eb", accent: "#7c3aed", text: "#0f172a" },
  },
  {
    id: "playful",
    name: "Playful",
    tagline: "Vibrant, bouncy, energetic",
    traits: ["Bouncy springs", "Scale pops", "Thick borders"],
    colors: { bg: "#fdf4ff", primary: "#ec4899", accent: "#f97316", text: "#1e1b4b" },
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "Modern tech, cyan & purple",
    traits: ["Glass cards", "Grid overlay", "Mixed springs"],
    colors: { bg: "#f8fafc", primary: "#00d4ff", accent: "#a855f7", text: "#0f172a" },
  },
];

interface AnimationPlan {
  sceneName: string;
  compositionId: string;
  description: string;
  durationSeconds: number;
  durationFrames: number;
  fps: number;
  width: number;
  height: number;
  phases: Array<{
    name: string;
    startSecond: number;
    endSecond: number;
    description: string;
    elements: string[];
    animationType: string;
  }>;
  visualElements: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

const steps = [
  { key: "idle", label: "Describe", icon: Sparkle },
  { key: "reviewing", label: "Review", icon: FileTsx },
  { key: "generating", label: "Generate", icon: Play },
  { key: "done", label: "Done", icon: CheckCircle },
];

const STORAGE_KEY = "animotion_session";

interface SessionSnapshot {
  state: AppState;
  style: StylePreset;
  prompt: string;
  plan: AnimationPlan | null;
  code: string;
  error: string;
  scenePath: string;
  fixed: boolean;
  duration: string;
  fpsOption: number;
}

function loadSession(): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
}

function saveSession(snapshot: SessionSnapshot) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function safeState(s: AppState): AppState {
  if (s === "planning") return "idle";
  if (s === "generating" || s === "writing") return "reviewing";
  return s;
}

export default function Home() {
  const [restored, setRestored] = useState(false);
  const [state, setState] = useState<AppState>("idle");
  const [style, setStyle] = useState<StylePreset>("standard");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<AnimationPlan | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [scenePath, setScenePath] = useState("");
  const [fixed, setFixed] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [planPreview, setPlanPreview] = useState<Partial<AnimationPlan> | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [fpsOption, setFpsOption] = useState<number>(30);
  const [feedback, setFeedback] = useState("");
  const [writeStep, setWriteStep] = useState<"writing" | "validating" | "fixing">("writing");
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ file: string; sizeMB: string } | null>(null);
  const [renderError, setRenderError] = useState("");
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      const safe = safeState(saved.state);
      setState(safe);
      setStyle(saved.style);
      setPrompt(saved.prompt);
      setPlan(saved.plan);
      setCode(saved.code);
      setError(saved.error);
      setScenePath(saved.scenePath);
      setFixed(saved.fixed);
      setDuration(saved.duration);
      setFpsOption(saved.fpsOption);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    saveSession({ state, style, prompt, plan, code, error, scenePath, fixed, duration, fpsOption });
  }, [restored, state, style, prompt, plan, code, error, scenePath, fixed, duration, fpsOption]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamingText]);

  async function consumeSSE(
    url: string,
    body: object,
    onDelta: (text: string, snapshot?: unknown) => void,
  ): Promise<{ type: string; [key: string]: unknown }> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Request failed");
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result: { type: string; [key: string]: unknown } = { type: "done" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "delta") {
              onDelta(data.text, data.snapshot);
            } else {
              result = data;
            }
          } catch {}
        }
      }
    }

    return result;
  }

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setState("planning");
    setError("");
    setStreamingText("");
    setPlanPreview(null);

    try {
      let accumulated = "";
      const result = await consumeSSE(
        "/api/generate-plan",
        { prompt, style, duration: duration ? Number(duration) : undefined, fps: fpsOption },
        (text, snapshot) => {
          accumulated += text;
          setStreamingText(accumulated);
          if (snapshot && typeof snapshot === "object") {
            setPlanPreview(snapshot as Partial<AnimationPlan>);
          }
        }
      );

      if (result.type === "error") {
        throw new Error(result.error as string);
      }

      setPlan(result.plan as AnimationPlan);
      setPlanPreview(null);
      setStreamingText("");
      setState("reviewing");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
      setState("error");
    }
  };

  const handleApproveAndGenerate = async () => {
    if (!plan) return;
    setState("generating");
    setError("");
    setStreamingText("");

    try {
      let accumulated = "";
      const result = await consumeSSE(
        "/api/generate-code",
        { plan, prompt, style },
        (text) => {
          accumulated += text;
          setStreamingText(accumulated);
        }
      );

      if (result.type === "error") {
        throw new Error(result.error as string);
      }

      const generatedCode = result.code as string;
      setCode(generatedCode);
      setStreamingText("");

      setState("writing");
      setWriteStep("writing");
      // Brief delay so the user sees "Writing file..." before it jumps to validating
      await new Promise(r => setTimeout(r, 300));
      setWriteStep("validating");
      const writeRes = await fetch("/api/write-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneName: plan.sceneName,
          code: generatedCode,
          durationFrames: plan.durationFrames,
          fps: plan.fps,
          style,
        }),
      });
      const writeData = await writeRes.json();

      if (writeData.success) {
        if (writeData.fixed) {
          setWriteStep("fixing");
          await new Promise(r => setTimeout(r, 600));
        }
        setScenePath(writeData.scenePath);
        setFixed(writeData.fixed || false);
        if (writeData.code) setCode(writeData.code);
        setState("done");
      } else {
        setError(writeData.tsErrors || writeData.error || "Write failed");
        if (writeData.code) setCode(writeData.code);
        setState("error");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate code");
      setState("error");
    }
  };

  const handleReset = () => {
    clearSession();
    setState("idle");
    setStyle("standard");
    setPrompt("");
    setPlan(null);
    setCode("");
    setError("");
    setScenePath("");
    setFixed(false);
    setStreamingText("");
    setPlanPreview(null);
    setDuration("");
    setFpsOption(30);
    setFeedback("");
    setWriteStep("writing");
    setRendering(false);
    setRenderResult(null);
    setRenderError("");
  };

  const handleRender = async () => {
    if (!plan) return;
    setRendering(true);
    setRenderError("");
    setRenderResult(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: plan.sceneName }),
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

  const handleRevisePlan = async () => {
    if (!plan || !feedback.trim()) return;
    setState("planning");
    setError("");
    setStreamingText("");
    setPlanPreview(null);

    try {
      let accumulated = "";
      const result = await consumeSSE(
        "/api/generate-plan",
        { prompt, style, currentPlan: plan, feedback, duration: duration ? Number(duration) : undefined, fps: fpsOption },
        (text, snapshot) => {
          accumulated += text;
          setStreamingText(accumulated);
          if (snapshot && typeof snapshot === "object") {
            setPlanPreview(snapshot as Partial<AnimationPlan>);
          }
        }
      );

      if (result.type === "error") {
        throw new Error(result.error as string);
      }

      setPlan(result.plan as AnimationPlan);
      setPlanPreview(null);
      setStreamingText("");
      setFeedback("");
      setState("reviewing");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revise plan");
      setState("error");
    }
  };

  const updatePlanDuration = (seconds: number) => {
    if (!plan || seconds < 1) return;
    setPlan({ ...plan, durationSeconds: seconds, durationFrames: seconds * plan.fps });
  };

  const updatePlanFps = (newFps: number) => {
    if (!plan) return;
    setPlan({ ...plan, fps: newFps, durationFrames: plan.durationSeconds * newFps });
  };

  const updatePhaseTime = (index: number, field: "startSecond" | "endSecond", value: number) => {
    if (!plan) return;
    const phases = [...plan.phases];
    phases[index] = { ...phases[index], [field]: value };
    setPlan({ ...plan, phases });
  };

  const getStepStatus = (stepKey: string) => {
    const order = ["idle", "planning", "reviewing", "generating", "writing", "done"];
    const ci = order.indexOf(state === "error" ? "idle" : state);
    const si = order.indexOf(stepKey === "done" ? "done" : stepKey);
    if (stepKey === state || (state === "writing" && stepKey === "generating") || (state === "planning" && stepKey === "idle")) return "active";
    if (si < ci) return "done";
    return "pending";
  };

  return (
    <div className="mx-auto max-w-[900px] w-full px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/25">
            <Sparkle size={20} weight="fill" className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Animotion</h1>
            <p className="text-sm text-muted-foreground">Describe an animation. Get a Remotion scene.</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => {
          const status = getStepStatus(s.key);
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    status === "active"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : status === "done"
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "done" ? (
                    <CheckCircle size={16} weight="bold" />
                  ) : (
                    <Icon size={16} weight={status === "active" ? "fill" : "regular"} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    status === "active"
                      ? "text-primary"
                      : status === "done"
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-4 h-px flex-1 min-w-8 ${
                    getStepStatus(steps[i + 1].key) !== "pending" ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* IDLE */}
      {state === "idle" && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Style Selector */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <Palette size={14} /> Style
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {styleOptions.map((s) => {
                  const selected = style === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`rounded-xl text-left transition-all overflow-hidden ${
                        selected
                          ? "ring-2 ring-primary shadow-sm"
                          : "border border-border hover:border-primary/30"
                      }`}
                    >
                      {/* Mini preview swatch */}
                      <div className="h-16 relative" style={{ background: s.colors.bg }}>
                        {/* Fake card */}
                        <div
                          className="absolute top-3 left-3 right-3 h-7 rounded"
                          style={{
                            background: s.id === "standard" ? "rgba(255,255,255,0.7)" : "#fff",
                            border: s.id === "playful" ? `2px solid ${s.colors.primary}30` : `1px solid ${s.colors.text}10`,
                            borderRadius: s.id === "playful" ? 10 : s.id === "professional" ? 4 : 6,
                            backdropFilter: s.id === "standard" ? "blur(4px)" : undefined,
                          }}
                        />
                        {/* Color bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                          <div className="flex-1" style={{ background: s.colors.primary }} />
                          <div className="flex-1" style={{ background: s.colors.accent }} />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                          {s.name}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.tagline}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.traits.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Prompt */}
            <div>
              <Label htmlFor="prompt" className="text-sm font-semibold mb-2 block">
                What animation do you want to create?
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Show how a neural network learns to recognize a cat with bouncy nodes and a confidence counter..."'
                className="min-h-[120px] resize-y"
              />
            </div>

            {/* Parameters */}
            <div className="flex gap-4 items-end">
              <div>
                <Label htmlFor="duration" className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Timer size={12} /> Duration
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="duration"
                    type="number"
                    min={3}
                    max={60}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="auto"
                    className="font-mono w-20"
                  />
                  <span className="text-xs text-muted-foreground">sec</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">FPS</Label>
                <Select value={String(fpsOption)} onValueChange={(v) => setFpsOption(Number(v))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGeneratePlan} disabled={!prompt.trim()} size="lg" className="w-full">
              Generate Plan
              <ArrowRight size={16} weight="bold" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PLANNING */}
      {state === "planning" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <SpinnerGap size={18} className="animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Planning your animation...</span>
            </div>

            {planPreview && (planPreview.sceneName || planPreview.phases) ? (
              <div className="opacity-90 space-y-4">
                {planPreview.sceneName && (
                  <div className="rounded-lg bg-muted/50 border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-base font-bold font-mono text-foreground">{planPreview.sceneName}</code>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: styleOptions.find(s => s.id === style)?.colors.primary + "40", color: styleOptions.find(s => s.id === style)?.colors.primary }}>
                            {style}
                          </Badge>
                        </div>
                        {planPreview.description && (
                          <p className="text-sm text-muted-foreground">{planPreview.description}</p>
                        )}
                      </div>
                      {planPreview.durationSeconds && (
                        <div className="flex gap-1.5 shrink-0 ml-4">
                          <Badge variant="secondary" className="font-mono">{planPreview.durationSeconds}s</Badge>
                          {planPreview.fps && <Badge variant="secondary" className="font-mono">{planPreview.fps}fps</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {planPreview.phases && planPreview.phases.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Phases</p>
                    <div className="space-y-2">
                      {planPreview.phases.map((phase, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold">{phase.name}</span>
                            {phase.startSecond != null && phase.endSecond != null && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {phase.startSecond}s - {phase.endSecond}s
                              </span>
                            )}
                          </div>
                          {phase.description && (
                            <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {planPreview.visualElements && planPreview.visualElements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Visual Elements</p>
                    <div className="flex flex-wrap gap-1.5">
                      {planPreview.visualElements.map((el, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {el.name}{el.type ? ` (${el.type})` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Designing phases, timing, and visual elements...</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* REVIEWING */}
      {state === "reviewing" && plan && (
        <Card>
          <CardHeader>
            <div className="rounded-lg bg-muted/50 border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-base font-bold font-mono text-foreground">{plan.sceneName}</code>
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: styleOptions.find(s => s.id === style)?.colors.primary + "40", color: styleOptions.find(s => s.id === style)?.colors.primary }}>
                      {style}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex gap-2 items-center shrink-0 ml-4">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={plan.durationSeconds}
                    onChange={(e) => updatePlanDuration(Number(e.target.value))}
                    className="w-14 h-7 text-center text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                  <Select value={String(plan.fps)} onValueChange={(v) => updatePlanFps(Number(v))}>
                    <SelectTrigger className="w-16 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">fps</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Phases */}
            {plan.phases && plan.phases.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Phases</p>
                <div className="space-y-2">
                  {plan.phases.map((phase, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">{phase.name}</span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={phase.startSecond}
                            onChange={(e) => updatePhaseTime(i, "startSecond", Number(e.target.value))}
                            className="w-12 h-6 text-center text-xs font-mono p-0"
                          />
                          <span className="text-xs text-muted-foreground">-</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={phase.endSecond}
                            onChange={(e) => updatePhaseTime(i, "endSecond", Number(e.target.value))}
                            className="w-12 h-6 text-center text-xs font-mono p-0"
                          />
                          <span className="text-xs text-muted-foreground">s</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Elements */}
            {plan.visualElements && plan.visualElements.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Visual Elements</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.visualElements.map((el, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {el.name} ({el.type})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Feedback */}
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='Suggest changes... (e.g. "make the token split more dramatic", "add a shake effect when overflow happens")'
              className="min-h-[80px] resize-y"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleApproveAndGenerate} className="bg-success text-white hover:bg-success/80">
                <CheckCircle size={16} weight="bold" />
                Approve & Generate
              </Button>
              <Button variant="outline" onClick={handleRevisePlan} disabled={!feedback.trim()}>
                Revise Plan
              </Button>
              <Button variant="ghost" onClick={handleReset}>Start Over</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GENERATING */}
      {state === "generating" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <SpinnerGap size={18} className="animate-spin text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Generating code...</span>
              </div>
              {streamingText && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {streamingText.split("\n").length} lines
                </Badge>
              )}
            </div>
            <div
              ref={streamRef}
              className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed overflow-auto max-h-[400px] whitespace-pre-wrap break-words text-muted-foreground"
            >
              {streamingText || "..."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* WRITING */}
      {state === "writing" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                { key: "writing", label: "Writing file to disk" },
                { key: "validating", label: "Validating TypeScript" },
                { key: "fixing", label: "Auto-fixing issues" },
              ].map((step) => {
                const stepOrder = ["writing", "validating", "fixing"];
                const currentIdx = stepOrder.indexOf(writeStep);
                const stepIdx = stepOrder.indexOf(step.key);
                const isDone = stepIdx < currentIdx;
                const isActive = step.key === writeStep;
                // Only show "fixing" step if we're actually at that step
                if (step.key === "fixing" && writeStep !== "fixing") return null;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle size={18} weight="fill" className="text-success" />
                    ) : isActive ? (
                      <SpinnerGap size={18} className="animate-spin text-primary" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-muted" />
                    )}
                    <span className={`text-sm ${isActive ? "font-semibold text-foreground" : isDone ? "text-success" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DONE */}
      {state === "done" && plan && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="rounded-lg bg-success/5 border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} weight="fill" className="text-success" />
                <code className="text-base font-bold font-mono">{plan.sceneName}</code>
                <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Ready</Badge>
                {fixed && <Badge variant="secondary" className="text-[10px]">Auto-fixed</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Written to <code className="text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">{scenePath}</code>
              </p>
            </div>

            {/* Live Preview */}
            <div>
              <p className="text-sm font-semibold mb-2">Preview</p>
              <RemotionPreview
                key={scenePath}
                sceneName={plan.sceneName}
                durationInFrames={plan.durationFrames}
                fps={plan.fps}
              />
            </div>

            {/* Render */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Render to MP4</p>
                  <p className="text-xs text-muted-foreground mt-0.5">1080p, {plan.fps}fps</p>
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
                  <Button
                    size="sm"
                    onClick={handleRender}
                    disabled={rendering}
                  >
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
            </div>

            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                View code ({code.split("\n").length} lines)
              </summary>
              <div className="mt-2">
                <CodeBlock code={code} />
              </div>
            </details>

            <Button onClick={handleReset}>Create Another</Button>
          </CardContent>
        </Card>
      )}

      {/* ERROR */}
      {state === "error" && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 space-y-4">
            <Badge variant="destructive">
              <Warning size={12} weight="bold" />
              Error
            </Badge>
            {/* Structured TS error display */}
            {error.includes("error TS") ? (
              <div className="space-y-2">
                {error.split("\n").filter(Boolean).map((line, i) => {
                  const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
                  if (match) {
                    return (
                      <div key={i} className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <code className="text-destructive font-mono font-bold">{match[4]}</code>
                          <span className="text-muted-foreground">{match[1]}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">L{match[2]}:{match[3]}</Badge>
                        </div>
                        <p className="text-sm text-destructive">{match[5]}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-sm text-destructive">{line}</p>;
                })}
              </div>
            ) : (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {code && (
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">View code</summary>
                <div className="mt-2">
                  <CodeBlock code={code} maxHeight={400} />
                </div>
              </details>
            )}
            <Button onClick={handleReset}>Start Over</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
