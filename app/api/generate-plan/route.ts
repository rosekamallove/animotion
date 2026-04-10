import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const plan = await generatePlan(prompt);

    return NextResponse.json({ plan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate plan";
    console.error("Plan generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
