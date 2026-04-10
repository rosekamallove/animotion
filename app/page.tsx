"use client";

import { useState } from "react";

type AppState = "idle" | "planning" | "reviewing" | "generating" | "writing" | "done" | "error";

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

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<AnimationPlan | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [scenePath, setScenePath] = useState("");
  const [fixed, setFixed] = useState(false);

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setState("planning");
    setError("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data.plan);
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

    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCode(data.code);

      setState("writing");
      const writeRes = await fetch("/api/write-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneName: plan.sceneName,
          code: data.code,
          durationFrames: plan.durationFrames,
          fps: plan.fps,
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
    setState("idle");
    setPrompt("");
    setPlan(null);
    setCode("");
    setError("");
    setScenePath("");
    setFixed(false);
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
          <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            What animation do you want to create?
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Create a 10-second scene showing three stat cards bouncing in with large numbers on a dark background..."'
          />
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleGeneratePlan} disabled={!prompt.trim()}>
              Generate Plan
            </button>
          </div>
        </div>
      )}

      {/* PLANNING */}
      {state === "planning" && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>Planning your animation...</div>
          <div style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 8 }}>
            Claude is designing phases, timing, and visual elements
          </div>
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
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-info">{plan.durationSeconds}s</span>
              <span className="badge badge-info">{plan.fps}fps</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-fg)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Phases
            </div>
            {plan.phases.map((phase, i) => (
              <div key={i} style={{ padding: "12px 16px", borderRadius: 8, background: "var(--muted)", marginBottom: 8, borderLeft: "3px solid var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{phase.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted-fg)", fontFamily: "monospace" }}>
                    {phase.startSecond}s - {phase.endSecond}s
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 4 }}>{phase.description}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
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
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn btn-success" onClick={handleApproveAndGenerate}>
              Approve & Generate Code
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Start Over</button>
          </div>
        </div>
      )}

      {/* GENERATING / WRITING */}
      {(state === "generating" || state === "writing") && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>
            {state === "generating" ? "Generating animation code..." : "Writing to disk & validating TypeScript..."}
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
            <div className="code-block" style={{ maxHeight: 60 }}>cd video-animations{"\n"}npx remotion studio</div>
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
