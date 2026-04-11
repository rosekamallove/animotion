import { NextRequest, NextResponse } from "next/server";
import { streamCode } from "../../../lib/claude";
import type { AnimationPlan } from "../../../lib/claude";
import { getVideoContext, formatVideoContext } from "../../../lib/videos";

export async function POST(req: NextRequest) {
  try {
    const { plan, prompt, style, videoId } = await req.json();

    if (!plan || !prompt) {
      return NextResponse.json(
        { error: "Plan and prompt are required" },
        { status: 400 }
      );
    }

    // Build video context if this scene belongs to a video
    let videoContext: string | undefined;
    if (videoId) {
      const ctx = getVideoContext(videoId);
      if (ctx) {
        videoContext = formatVideoContext(ctx);
      }
    }

    const stream = streamCode(plan as AnimationPlan, prompt, style || "standard", videoContext);
    const encoder = new TextEncoder();
    let fullCode = "";

    const readable = new ReadableStream({
      start(controller) {
        let closed = false;

        stream.on("text", (text) => {
          if (closed) return;
          fullCode += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", text })}\n\n`)
          );
        });

        stream.on("finalMessage", () => {
          if (closed) return;
          closed = true;
          // Strip markdown fences if present
          let code = fullCode.trim();
          if (code.startsWith("```")) {
            code = code.replace(/^```(?:tsx?)?\n?/, "").replace(/\n?```$/, "");
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", code })}\n\n`)
          );
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
    const message = error instanceof Error ? error.message : "Failed to generate code";
    console.error("Code generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
