import { NextRequest, NextResponse } from "next/server";
import { generateCode, fixCode } from "../../../lib/claude";
import { AnimationPlan } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { plan, prompt } = await req.json();

    if (!plan || !prompt) {
      return NextResponse.json(
        { error: "Plan and prompt are required" },
        { status: 400 }
      );
    }

    let code = await generateCode(plan as AnimationPlan, prompt);

    return NextResponse.json({ code });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate code";
    console.error("Code generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
