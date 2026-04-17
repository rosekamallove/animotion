import { NextRequest, NextResponse } from "next/server";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { streamChat, type ChatContext } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, style, videoName, videoScript, sceneContext } = body as {
      messages: MessageParam[];
      style: ChatContext["style"];
      videoName?: string;
      videoScript?: string;
      sceneContext?: ChatContext["sceneContext"];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    console.log(
      `[chat] ${messages.length} message(s), style=${style || "standard"}, sceneContext=${sceneContext ? "yes" : "no"}`,
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let closed = false;
        const send = (event: Record<string, unknown>) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch (err) {
            console.error("[chat] enqueue failed:", err);
          }
        };

        const closeOnce = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {}
        };

        try {
          const stream = streamChat(messages, {
            style: style || "standard",
            videoName,
            videoScript,
            sceneContext,
          });

          stream.on("text", (text) => {
            send({ type: "text_delta", text });
          });

          stream.on("error", (err) => {
            console.error("[chat] stream error:", err);
            send({ type: "error", error: err instanceof Error ? err.message : String(err) });
            closeOnce();
          });

          const finalMessage = await stream.finalMessage();
          if (closed) return;

          const textBlock = finalMessage.content.find((b) => b.type === "text");
          const toolBlock = finalMessage.content.find((b) => b.type === "tool_use");

          const fullText = textBlock && textBlock.type === "text" ? textBlock.text : "";

          console.log(
            `[chat] done. text=${fullText.length} chars, tool=${toolBlock?.type === "tool_use" ? toolBlock.name : "none"}`,
          );

          if (toolBlock && toolBlock.type === "tool_use") {
            send({
              type: "done",
              text: fullText,
              tool: { id: toolBlock.id, name: toolBlock.name, input: toolBlock.input },
            });
          } else {
            send({ type: "done", text: fullText, tool: null });
          }
          closeOnce();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[chat] fatal:", msg);
          send({ type: "error", error: msg });
          closeOnce();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chat failed";
    console.error("[chat] request error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
