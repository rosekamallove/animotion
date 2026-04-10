"use client";

import { useState, useRef, useEffect } from "react";

type AppState = "idle" | "planning" | "reviewing" | "generating" | "writing" | "done" | "error";
type StylePreset = "professional" | "playful" | "standard";

const styleOptions: Array<{
  id: StylePreset;
  name: string;
  tagline: string;
  colors: [string, string, string];
  bg: string;
}> = [
  { id: "professional", name: "Professional", tagline: "Clean, corporate, data-focused", colors: ["#2563eb", "#7c3aed", "#16a34a"], bg: "#ffffff" },
  { id: "playful", name: "Playful", tagline: "Vibrant, bouncy, energetic", colors: ["#ec4899", "#f97316", "#14b8a6"], bg: "#fdf4ff" },
  { id: "standard", name: "Standard", tagline: "Modern tech, cyan & purple", colors: ["#00d4ff", "#a855f7", "#22c55e"], bg: "#f8fafc" },
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
  { key: "idle", label: "1. Describe" },
  { key: "reviewing", label: "2. Review Plan" },
  { key: "generating", label: "3. Generate" },
  { key: "done", label: "4. Done" },
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
  } catch {
    // Storage full or unavailable — ignore
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/** Mid-stream states can't be resumed — snap back to the last safe state */
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
  const streamRef = useRef<HTMLDivElement>(null);

  // Restore session on mount
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

  // Save session on meaningful state changes
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
          } catch {
            // Ignore malformed SSE lines
          }
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

  const getStepClass = (stepKey: string) => {
    const order = ["idle", "planning", "reviewing", "generating", "writing", "done"];
    const ci = order.indexOf(state === "error" ? "idle" : state);
    const si = order.indexOf(stepKey === "done" ? "done" : stepKey);
    if (stepKey === state || (state === "writing" && stepKey === "generating") || (state === "planning" && stepKey === "idle")) return "step active";
    if (si < ci) return "step done";
    return "step";
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h1><span style={{ color: "var(--primary)" }}>Animotion</span></h1>
        <h2 style={{ marginTop: 8 }}>Describe an animation. Get a Remotion scene.</h2>
      </div>

      <div className="step-indicator">
        {steps.map((s) => (
          <div key={s.key} className={getStepClass(s.key)}>{s.label}</div>
        ))}
      </div>

      {/* IDLE */}
      {state === "idle" && (
        <div className="card">
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", textTransform: "uppercase", letterSpacing: 1 }}>
            Style
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {styleOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  flex: 1,
                  padding: "16px 16px 14px",
                  borderRadius: 12,
                  border: style === s.id ? `2px solid ${s.colors[0]}` : "2px solid var(--border)",
                  background: style === s.id ? `${s.colors[0]}12` : "var(--muted)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {s.colors.map((c, i) => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: style === s.id ? s.colors[0] : "var(--foreground)" }}>{s.name}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-fg)", lineHeight: 1.4 }}>{s.tagline}</div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            What animation do you want to create?
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Create a 10-second scene showing three stat cards bouncing in with large numbers on a dark background..."'
          />
          <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-fg)" }}>Duration</label>
              <input
                type="number"
                min="3"
                max="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="auto"
                style={{
                  width: 70, padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--muted)",
                  color: "var(--foreground)", fontSize: 14, fontFamily: "monospace",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--muted-fg)" }}>sec</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-fg)" }}>FPS</label>
              <select
                value={fpsOption}
                onChange={(e) => setFpsOption(Number(e.target.value))}
                style={{
                  padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--muted)",
                  color: "var(--foreground)", fontSize: 14,
                }}
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleGeneratePlan} disabled={!prompt.trim()}>
              Generate Plan
            </button>
          </div>
        </div>
      )}

      {/* PLANNING */}
      {state === "planning" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="spinner" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)" }}>
              Planning your animation...
            </span>
          </div>

          {planPreview && (planPreview.sceneName || planPreview.phases) ? (
            <div style={{ opacity: 0.85 }}>
              {planPreview.sceneName && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{planPreview.sceneName}</div>
                    {planPreview.description && (
                      <div style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 4 }}>{planPreview.description}</div>
                    )}
                  </div>
                  {planPreview.durationSeconds && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className="badge badge-info">{planPreview.durationSeconds}s</span>
                      {planPreview.fps && <span className="badge badge-info">{planPreview.fps}fps</span>}
                    </div>
                  )}
                </div>
              )}

              {planPreview.phases && planPreview.phases.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                    Phases
                  </div>
                  {planPreview.phases.map((phase, i) => (
                    <div key={i} style={{ padding: "12px 16px", borderRadius: 8, background: "var(--muted)", marginBottom: 8, borderLeft: "3px solid var(--primary)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{phase.name}</span>
                        {phase.startSecond != null && phase.endSecond != null && (
                          <span style={{ fontSize: 12, color: "var(--muted-fg)", fontFamily: "monospace" }}>
                            {phase.startSecond}s - {phase.endSecond}s
                          </span>
                        )}
                      </div>
                      {phase.description && (
                        <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 4 }}>{phase.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {planPreview.visualElements && planPreview.visualElements.length > 0 && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                    Visual Elements
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {planPreview.visualElements.map((el, i) => (
                      <span key={i} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                        {el.name}{el.type ? ` (${el.type})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--muted-fg)" }}>
              Designing phases, timing, and visual elements...
            </div>
          )}
        </div>
      )}

      {/* REVIEWING */}
      {state === "reviewing" && plan && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{plan.sceneName}</div>
              <div style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 4 }}>{plan.description}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={plan.durationSeconds}
                  onChange={(e) => updatePlanDuration(Number(e.target.value))}
                  style={{
                    width: 44, padding: "4px 6px", borderRadius: 6, textAlign: "center",
                    border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.15)",
                    color: "var(--primary)", fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>s</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <select
                  value={plan.fps}
                  onChange={(e) => updatePlanFps(Number(e.target.value))}
                  style={{
                    padding: "4px 6px", borderRadius: 6,
                    border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.15)",
                    color: "var(--primary)", fontSize: 12, fontWeight: 700,
                  }}
                >
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>fps</span>
              </div>
            </div>
          </div>

          {plan.phases && plan.phases.length > 0 && <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Phases
            </div>
            {plan.phases.map((phase, i) => (
              <div key={i} style={{ padding: "12px 16px", borderRadius: 8, background: "var(--muted)", marginBottom: 8, borderLeft: "3px solid var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{phase.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={phase.startSecond}
                      onChange={(e) => updatePhaseTime(i, "startSecond", Number(e.target.value))}
                      style={{
                        width: 40, padding: "2px 4px", borderRadius: 4, textAlign: "center",
                        border: "1px solid var(--border)", background: "transparent",
                        color: "var(--muted-fg)", fontSize: 12, fontFamily: "monospace",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "var(--muted-fg)" }}>-</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={phase.endSecond}
                      onChange={(e) => updatePhaseTime(i, "endSecond", Number(e.target.value))}
                      style={{
                        width: 40, padding: "2px 4px", borderRadius: 4, textAlign: "center",
                        border: "1px solid var(--border)", background: "transparent",
                        color: "var(--muted-fg)", fontSize: 12, fontFamily: "monospace",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "var(--muted-fg)" }}>s</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 4 }}>{phase.description}</div>
              </div>
            ))}
          </div>}

          {plan.visualElements && plan.visualElements.length > 0 && <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Visual Elements
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {plan.visualElements.map((el, i) => (
                <span key={i} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  {el.name} ({el.type})
                </span>
              ))}
            </div>
          </div>}

          <div style={{ marginBottom: 20 }}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Suggest changes... (e.g. &quot;make the token split more dramatic&quot;, &quot;add a shake effect when overflow happens&quot;)"
              style={{ minHeight: 80 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-success" onClick={handleApproveAndGenerate}>
              Approve & Generate Code
            </button>
            <button
              className="btn btn-primary"
              onClick={handleRevisePlan}
              disabled={!feedback.trim()}
            >
              Revise Plan
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Start Over</button>
          </div>
        </div>
      )}

      {/* GENERATING */}
      {state === "generating" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="spinner" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)" }}>
                Generating code...
              </span>
            </div>
            {streamingText && (
              <span style={{ fontSize: 12, color: "var(--muted-fg)", fontFamily: "monospace" }}>
                {streamingText.split("\n").length} lines
              </span>
            )}
          </div>
          <div ref={streamRef} className="code-block" style={{ maxHeight: 400 }}>
            {streamingText || "..."}
          </div>
        </div>
      )}

      {/* WRITING */}
      {state === "writing" && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>
            Writing to disk & validating TypeScript...
          </div>
        </div>
      )}

      {/* DONE */}
      {state === "done" && plan && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span className="badge badge-success">Success</span>
            {fixed && <span className="badge badge-info">Auto-fixed</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.sceneName} is ready!</div>
          <div style={{ fontSize: 14, color: "var(--muted-fg)", marginBottom: 20 }}>
            Written to: <code style={{ color: "var(--primary)" }}>{scenePath}</code>
          </div>

          <div style={{ padding: 16, borderRadius: 10, background: "var(--muted)", border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Preview:</div>
            <div className="code-block" style={{ maxHeight: 60 }}>cd remotion{"\n"}npx remotion studio</div>
            <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 8 }}>
              Select <strong style={{ color: "var(--primary)" }}>{plan.sceneName}</strong> from the Generated folder.
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 10, background: "var(--muted)", border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Render:</div>
            <div className="code-block" style={{ maxHeight: 40 }}>npx remotion render {plan.sceneName} out/{plan.sceneName}.mp4</div>
          </div>

          <details style={{ marginBottom: 20 }}>
            <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--muted-fg)" }}>
              View code ({code.split("\n").length} lines)
            </summary>
            <div className="code-block" style={{ marginTop: 8, maxHeight: 500 }}>{code}</div>
          </details>

          <button className="btn btn-primary" onClick={handleReset}>Create Another</button>
        </div>
      )}

      {/* ERROR */}
      {state === "error" && (
        <div className="card" style={{ borderTop: "3px solid var(--destructive)" }}>
          <span className="badge badge-error" style={{ marginBottom: 16 }}>Error</span>
          <div style={{ fontSize: 14, color: "var(--destructive)", marginBottom: 16 }}>{error}</div>
          {code && (
            <details style={{ marginBottom: 16 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--muted-fg)" }}>View code</summary>
              <div className="code-block" style={{ marginTop: 8 }}>{code}</div>
            </details>
          )}
          <button className="btn btn-primary" onClick={handleReset}>Start Over</button>
        </div>
      )}
    </div>
  );
}
