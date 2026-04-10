import { NextRequest, NextResponse } from "next/server";
import { streamCode } from "../../../lib/claude";
import type { AnimationPlan } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { plan, prompt, style } = await req.json();

    if (!plan || !prompt) {
      return NextResponse.json(
        { error: "Plan and prompt are required" },
        { status: 400 }
      );
    }

    const stream = streamCode(plan as AnimationPlan, prompt, style || "standard");
    const encoder = new TextEncoder();
    let fullCode = "";

    const readable = new ReadableStream({
      start(controller) {
        stream.on("text", (text) => {
          fullCode += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", text })}\n\n`)
          );
        });

        stream.on("finalMessage", () => {
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
