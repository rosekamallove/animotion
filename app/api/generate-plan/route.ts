import { NextRequest, NextResponse } from "next/server";
import { streamPlan } from "../../../lib/claude";
import type { AnimationPlan } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const stream = streamPlan(prompt, style || "standard");
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      start(controller) {
        let closed = false;

        stream.on("inputJson", (partialJson, jsonSnapshot) => {
          if (closed) return;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", text: partialJson, snapshot: jsonSnapshot })}\n\n`)
          );
        });

        stream.on("finalMessage", (message) => {
          if (closed) return;
          closed = true;
          const toolBlock = message.content.find((b) => b.type === "tool_use");
          if (toolBlock && toolBlock.type === "tool_use") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done", plan: toolBlock.input as AnimationPlan })}\n\n`)
            );
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", error: "No structured plan returned" })}\n\n`)
            );
          }
          controller.close();
        });

        stream.on("error", (err) => {
          if (closed) return;
          closed = true;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`)
          );
          controller.close();
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate plan";
    console.error("Plan generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
