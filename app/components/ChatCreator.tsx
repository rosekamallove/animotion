"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RemotionPreview } from "./RemotionPreview";
import { CodeBlock } from "./CodeBlock";
import {
  PaperPlaneTilt,
  Sparkle,
  SpinnerGap,
  CheckCircle,
  Warning,
  User,
  DownloadSimple,
  FilmStrip,
} from "@phosphor-icons/react";

type StylePreset = "professional" | "playful" | "standard";

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

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

interface APIMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

type PlanStatus =
  | { kind: "proposed" }
  | { kind: "generating"; streamedCode: string }
  | { kind: "writing"; code: string; step: "writing" | "validating" | "fixing" }
  | { kind: "done"; code: string; scenePath: string; fixed: boolean }
  | { kind: "error"; error: string; code?: string }
  | { kind: "superseded" };

type Turn =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "agent_text"; text: string }
  | { id: string; kind: "agent_question"; question: string; toolUseId: string }
  | { id: string; kind: "agent_plan"; plan: AnimationPlan; toolUseId: string; status: PlanStatus }
  | { id: string; kind: "agent_pending"; streamedText: string }
  | { id: string; kind: "error"; error: string };

interface ImplementedScene {
  sceneName: string;
  plan: AnimationPlan;
  code: string;
}

interface ChatCreatorProps {
  videoId?: string;
  videoName?: string;
  videoStyle?: StylePreset;
  videoScript?: string;
  onComplete?: (sceneName: string) => void;
  onBack?: () => void;
}

const styleColors: Record<StylePreset, string> = {
  professional: "#2563eb",
  playful: "#ec4899",
  standard: "#00d4ff",
};

export function ChatCreator({
  videoId,
  videoName,
  videoStyle,
  videoScript,
  onComplete,
  onBack,
}: ChatCreatorProps) {
  const [style, setStyle] = useState<StylePreset>(videoStyle || "standard");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [apiHistory, setApiHistory] = useState<APIMessage[]>([]);
  const [pendingToolResult, setPendingToolResult] = useState<{
    toolUseId: string;
    content: string;
  } | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [implemented, setImplemented] = useState<ImplementedScene | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ file: string; sizeMB: string } | null>(null);
  const [renderError, setRenderError] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [turns, implemented]);

  const genId = () => Math.random().toString(36).slice(2, 10);
  const appendTurns = (ts: Turn[]) => setTurns((prev) => [...prev, ...ts]);
  const updateTurn = (id: string, updater: (t: Turn) => Turn) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));

  const buildUserApiMessage = (text: string): APIMessage => {
    if (pendingToolResult) {
      const content: ContentBlock[] = [
        {
          type: "tool_result",
          tool_use_id: pendingToolResult.toolUseId,
          content: pendingToolResult.content,
        },
      ];
      if (text.trim()) content.push({ type: "text", text });
      return { role: "user", content };
    }
    return { role: "user", content: text };
  };

  const callChat = async (nextHistory: APIMessage[]) => {
    setSending(true);
    const pendingId = genId();
    appendTurns([{ id: pendingId, kind: "agent_pending", streamedText: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          style,
          videoName,
          videoScript,
          sceneContext: implemented
            ? { sceneName: implemented.sceneName, plan: implemented.plan, code: implemented.code }
            : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      type FinalEvent = {
        type: "done";
        text: string;
        tool: { id: string; name: string; input: Record<string, unknown> } | null;
      };
      let streamedText = "";
      let finalEvent: FinalEvent | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: { type: string; [k: string]: unknown };
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (event.type === "text_delta") {
            streamedText += event.text as string;
            updateTurn(pendingId, (t) =>
              t.kind === "agent_pending" ? { ...t, streamedText } : t,
            );
          } else if (event.type === "done") {
            finalEvent = event as unknown as FinalEvent;
          } else if (event.type === "error") {
            throw new Error((event.error as string) || "Chat stream error");
          }
        }
      }

      if (!finalEvent) throw new Error("Stream ended without a final event");

      const finalText = finalEvent.text || streamedText;
      const tool = finalEvent.tool;

      setTurns((prev) => {
        const filtered = prev.filter((t) => t.id !== pendingId);
        const add: Turn[] = [];
        if (finalText.trim()) add.push({ id: genId(), kind: "agent_text", text: finalText });
        if (tool) {
          if (tool.name === "ask_followup") {
            add.push({
              id: genId(),
              kind: "agent_question",
              question: (tool.input.question as string) || "",
              toolUseId: tool.id,
            });
          } else if (tool.name === "propose_plan") {
            add.push({
              id: genId(),
              kind: "agent_plan",
              plan: tool.input as unknown as AnimationPlan,
              toolUseId: tool.id,
              status: { kind: "proposed" },
            });
          }
        }
        if (add.length === 0) {
          add.push({ id: genId(), kind: "agent_text", text: "(no reply)" });
        }
        return [...filtered, ...add];
      });

      const assistantContent: ContentBlock[] = [];
      if (finalText.trim()) assistantContent.push({ type: "text", text: finalText });
      if (tool) {
        assistantContent.push({ type: "tool_use", id: tool.id, name: tool.name, input: tool.input });
        // Prepare a default tool_result; approve/revise flows can override this before send.
        setPendingToolResult({ toolUseId: tool.id, content: "OK" });
      } else {
        setPendingToolResult(null);
      }
      setApiHistory((h) => [...h, { role: "assistant", content: assistantContent }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      setTurns((prev) => {
        const filtered = prev.filter((t) => t.id !== pendingId);
        return [...filtered, { id: genId(), kind: "error", error: msg }];
      });
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");

    const userApiMsg = buildUserApiMessage(text);
    const nextHistory = [...apiHistory, userApiMsg];

    appendTurns([{ id: genId(), kind: "user", text }]);
    setApiHistory(nextHistory);
    setPendingToolResult(null);
    await callChat(nextHistory);
  };

  const handleApprove = async (turnId: string, plan: AnimationPlan, toolUseId: string) => {
    updateTurn(turnId, (t) =>
      t.kind === "agent_plan" ? { ...t, status: { kind: "generating", streamedCode: "" } } : t,
    );

    // Mark earlier done plans as superseded
    setTurns((prev) =>
      prev.map((t) =>
        t.kind === "agent_plan" && t.id !== turnId && t.status.kind === "done"
          ? { ...t, status: { kind: "superseded" } }
          : t,
      ),
    );

    // Use most recent user text as the prompt fallback; plan.description is backup
    const lastUser = [...turns].reverse().find((t) => t.kind === "user") as
      | Extract<Turn, { kind: "user" }>
      | undefined;
    const derivedPrompt = lastUser?.text || plan.description;

    try {
      const genRes = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          prompt: derivedPrompt,
          style,
          videoId,
          existingCode: implemented?.code,
        }),
      });
      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Generation failed");
      }

      const reader = genRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedCode = "";
      let finalCode = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "delta") {
              streamedCode += event.text;
              updateTurn(turnId, (t) =>
                t.kind === "agent_plan" && t.status.kind === "generating"
                  ? { ...t, status: { kind: "generating", streamedCode } }
                  : t,
              );
            } else if (event.type === "done") {
              finalCode = event.code;
            } else if (event.type === "error") {
              throw new Error(event.error);
            }
          } catch {}
        }
      }

      if (!finalCode) finalCode = streamedCode;

      updateTurn(turnId, (t) =>
        t.kind === "agent_plan"
          ? { ...t, status: { kind: "writing", code: finalCode, step: "writing" } }
          : t,
      );
      await new Promise((r) => setTimeout(r, 150));
      updateTurn(turnId, (t) =>
        t.kind === "agent_plan" && t.status.kind === "writing"
          ? { ...t, status: { ...t.status, step: "validating" } }
          : t,
      );

      const writeRes = await fetch("/api/write-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneName: plan.sceneName,
          code: finalCode,
          durationFrames: plan.durationFrames,
          fps: plan.fps,
          style,
          videoId,
          description: plan.description,
        }),
      });
      const writeData = await writeRes.json();

      if (writeData.success) {
        const codeOut = writeData.code || finalCode;
        if (writeData.fixed) {
          updateTurn(turnId, (t) =>
            t.kind === "agent_plan" && t.status.kind === "writing"
              ? { ...t, status: { ...t.status, step: "fixing", code: codeOut } }
              : t,
          );
          await new Promise((r) => setTimeout(r, 400));
        }

        updateTurn(turnId, (t) =>
          t.kind === "agent_plan"
            ? {
                ...t,
                status: {
                  kind: "done",
                  code: codeOut,
                  scenePath: writeData.scenePath,
                  fixed: !!writeData.fixed,
                },
              }
            : t,
        );

        setImplemented({ sceneName: plan.sceneName, plan, code: codeOut });

        // Stash the tool_result — it'll be prepended to the user's next message
        // (we can't add it eagerly without introducing two consecutive user messages).
        const resultContent = `User approved the plan. Scene "${plan.sceneName}" has been implemented${writeData.fixed ? " (one auto-fix was applied)" : ""}. The live preview is showing. The user may now request edits.`;
        setPendingToolResult({ toolUseId, content: resultContent });
        onComplete?.(plan.sceneName);
      } else {
        updateTurn(turnId, (t) =>
          t.kind === "agent_plan"
            ? {
                ...t,
                status: {
                  kind: "error",
                  error: writeData.tsErrors || writeData.error || "Write failed",
                  code: writeData.code || finalCode,
                },
              }
            : t,
        );
      }
    } catch (err) {
      updateTurn(turnId, (t) =>
        t.kind === "agent_plan"
          ? {
              ...t,
              status: { kind: "error", error: err instanceof Error ? err.message : "Failed" },
            }
          : t,
      );
    }
  };

  const handleRender = async () => {
    if (!implemented) return;
    setRendering(true);
    setRenderError("");
    setRenderResult(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: implemented.sceneName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRenderResult({ file: data.file, sizeMB: data.sizeMB });
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRendering(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const styleColor = styleColors[style];
  const placeholder = implemented
    ? 'Suggest changes... e.g. "make phase 2 snappier", "swap the icon to a brain"'
    : "Describe what you want to animate...";

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
            &larr; Back
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Sparkle size={18} weight="fill" className="text-primary" />
          <h2 className="text-lg font-semibold">Chat with the animator</h2>
        </div>
        {videoName && (
          <Badge variant="secondary" className="text-xs">
            {videoName}
          </Badge>
        )}
        {!videoStyle && (
          <div className="ml-auto">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StylePreset)}
              disabled={turns.length > 0}
              className="text-xs border rounded-md px-2 py-1 bg-background disabled:opacity-60"
              title={turns.length > 0 ? "Locked after conversation starts" : "Choose style"}
            >
              <option value="standard">Standard</option>
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
            </select>
          </div>
        )}
      </div>

      {/* Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
        {turns.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkle size={24} weight="fill" className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Describe what you want to animate. I&apos;ll ask if I need to clarify, propose a plan,
              and build it. Keep iterating after — &ldquo;make phase 1 slower&rdquo;, &ldquo;swap the
              icon&rdquo;, etc.
            </p>
          </div>
        )}

        {turns.map((turn) => (
          <TurnView
            key={turn.id}
            turn={turn}
            styleColor={styleColor}
            onApprove={(plan, toolUseId) => handleApprove(turn.id, plan, toolUseId)}
            onSuggestChanges={() => {
              const el = document.getElementById("chat-input");
              if (el) (el as HTMLTextAreaElement).focus();
            }}
          />
        ))}

        {implemented && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CheckCircle size={16} weight="fill" className="text-success" />
                <code className="text-sm font-bold font-mono">{implemented.sceneName}</code>
                <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                  live preview
                </Badge>
              </div>
              <RemotionPreview
                key={`${implemented.sceneName}-${implemented.code.length}`}
                sceneName={implemented.sceneName}
                durationInFrames={implemented.plan.durationFrames}
                fps={implemented.plan.fps}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Keep typing to edit — the animator sees the current scene.
                </p>
                <div className="flex items-center gap-2">
                  {renderResult && (
                    <a href={renderResult.file} download>
                      <Button variant="outline" size="sm">
                        <DownloadSimple size={12} weight="bold" />
                        {renderResult.sizeMB} MB
                      </Button>
                    </a>
                  )}
                  <Button size="sm" onClick={handleRender} disabled={rendering}>
                    {rendering ? (
                      <>
                        <SpinnerGap size={12} className="animate-spin" />
                        Rendering
                      </>
                    ) : (
                      <>
                        <FilmStrip size={12} weight="bold" />
                        Render MP4
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {renderError && <p className="text-xs text-destructive">{renderError}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t pt-3 mt-2">
        <div className="flex items-end gap-2">
          <Textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={sending}
            className="min-h-[60px] max-h-[180px] resize-none"
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()} size="lg">
            {sending ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="bold" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Enter to send, Shift+Enter for newline.
        </p>
      </div>
    </div>
  );
}

// --- Sub-components ---

function TurnView({
  turn,
  styleColor,
  onApprove,
  onSuggestChanges,
}: {
  turn: Turn;
  styleColor: string;
  onApprove: (plan: AnimationPlan, toolUseId: string) => void;
  onSuggestChanges: () => void;
}) {
  if (turn.kind === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
          {turn.text}
        </div>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User size={14} className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (turn.kind === "error") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <div className="flex items-center gap-2">
          <Warning size={14} weight="fill" className="text-destructive" />
          <span className="text-sm text-destructive">{turn.error}</span>
        </div>
      </div>
    );
  }

  if (turn.kind === "agent_text") {
    return <AgentBubble>{turn.text}</AgentBubble>;
  }

  if (turn.kind === "agent_pending") {
    return (
      <AgentBubble>
        {turn.streamedText ? (
          <span className="whitespace-pre-wrap">{turn.streamedText}</span>
        ) : (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <SpinnerGap size={14} className="animate-spin" />
            Thinking...
          </span>
        )}
      </AgentBubble>
    );
  }

  if (turn.kind === "agent_question") {
    return <AgentBubble>{turn.question}</AgentBubble>;
  }

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        <Sparkle size={14} weight="fill" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <PlanCard
          turn={turn}
          styleColor={styleColor}
          onApprove={onApprove}
          onSuggestChanges={onSuggestChanges}
        />
      </div>
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        <Sparkle size={14} weight="fill" className="text-primary" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

function PlanCard({
  turn,
  styleColor,
  onApprove,
  onSuggestChanges,
}: {
  turn: Extract<Turn, { kind: "agent_plan" }>;
  styleColor: string;
  onApprove: (plan: AnimationPlan, toolUseId: string) => void;
  onSuggestChanges: () => void;
}) {
  const { plan, status, toolUseId } = turn;

  return (
    <Card className={status.kind === "superseded" ? "opacity-60" : ""}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <code className="text-sm font-bold font-mono truncate">{plan.sceneName}</code>
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: styleColor + "40", color: styleColor }}
              >
                plan
              </Badge>
              {status.kind === "superseded" && (
                <Badge variant="secondary" className="text-[10px]">
                  superseded
                </Badge>
              )}
              {status.kind === "done" && (
                <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                  implemented{status.fixed ? " (auto-fixed)" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{plan.description}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {plan.durationSeconds}s
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {plan.fps}fps
            </Badge>
          </div>
        </div>

        {plan.phases && plan.phases.length > 0 && (
          <div className="space-y-1">
            {plan.phases.map((phase, i) => (
              <div
                key={i}
                className="p-2 rounded-md bg-muted/50 border-l-2 border-primary text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{phase.name}</span>
                  <span className="font-mono text-muted-foreground text-[10px]">
                    {phase.startSecond}s–{phase.endSecond}s
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5">{phase.description}</p>
              </div>
            ))}
          </div>
        )}

        {status.kind === "proposed" && (
          <>
            <Separator />
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => onApprove(plan, toolUseId)}
                className="bg-success text-white hover:bg-success/80"
              >
                <CheckCircle size={12} weight="bold" />
                Approve &amp; build
              </Button>
              <Button size="sm" variant="outline" onClick={onSuggestChanges}>
                Suggest changes
              </Button>
            </div>
          </>
        )}

        {status.kind === "generating" && (
          <ImplementingIndicator step="generating" streamedCode={status.streamedCode} />
        )}

        {status.kind === "writing" && <ImplementingIndicator step={status.step} />}

        {status.kind === "error" && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <div className="flex items-start gap-2">
              <Warning size={12} weight="fill" className="mt-0.5 shrink-0" />
              <span className="whitespace-pre-wrap break-words">{status.error}</span>
            </div>
          </div>
        )}

        {status.kind === "done" && (
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
              View code ({status.code.split("\n").length} lines)
            </summary>
            <div className="mt-2">
              <CodeBlock code={status.code} maxHeight={280} />
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

function ImplementingIndicator({
  step,
  streamedCode,
}: {
  step: "generating" | "writing" | "validating" | "fixing";
  streamedCode?: string;
}) {
  const labels = {
    generating: "Generating code",
    writing: "Writing file",
    validating: "Validating TypeScript",
    fixing: "Auto-fixing",
  } as const;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <SpinnerGap size={14} className="animate-spin text-primary" />
        <span>{labels[step]}...</span>
        {streamedCode !== undefined && streamedCode.length > 0 && (
          <Badge variant="secondary" className="font-mono ml-auto">
            {streamedCode.split("\n").length} lines
          </Badge>
        )}
      </div>
      {streamedCode && (
        <div className="rounded-md border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed overflow-auto max-h-[180px] whitespace-pre-wrap break-words text-muted-foreground">
          {streamedCode.slice(-800)}
        </div>
      )}
    </div>
  );
}
