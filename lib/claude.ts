import Anthropic from "@anthropic-ai/sdk";
import { getPlanSystemPrompt, getCodeSystemPrompt } from "./prompts";
import { StylePreset } from "./styles";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnimationPlan {
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
    animationType: "spring" | "interpolate" | "both";
  }>;
  visualElements: Array<{
    name: string;
    type: "text" | "shape" | "icon" | "container" | "chart" | "svg";
    description: string;
  }>;
}

const planTool = {
  name: "create_animation_plan" as const,
  description: "Create a structured animation plan for a Remotion scene",
  input_schema: {
    type: "object" as const,
    properties: {
      sceneName: { type: "string" as const, description: "PascalCase component name" },
      compositionId: { type: "string" as const, description: "Same as sceneName" },
      description: { type: "string" as const, description: "1-2 sentence summary" },
      durationSeconds: { type: "number" as const },
      durationFrames: { type: "number" as const },
      fps: { type: "number" as const },
      width: { type: "number" as const },
      height: { type: "number" as const },
      phases: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            startSecond: { type: "number" as const },
            endSecond: { type: "number" as const },
            description: { type: "string" as const },
            elements: { type: "array" as const, items: { type: "string" as const } },
            animationType: { type: "string" as const, enum: ["spring", "interpolate", "both"] },
          },
          required: ["name", "startSecond", "endSecond", "description", "elements", "animationType"],
        },
      },
      visualElements: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const },
            type: { type: "string" as const, enum: ["text", "shape", "icon", "container", "chart", "svg"] },
            description: { type: "string" as const },
          },
          required: ["name", "type", "description"],
        },
      },
    },
    required: ["sceneName", "compositionId", "description", "durationSeconds", "durationFrames", "fps", "width", "height", "phases", "visualElements"],
  },
};

export async function generatePlan(prompt: string, style: StylePreset = "standard"): Promise<AnimationPlan> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create a detailed animation plan for:\n\n${prompt}`,
      },
    ],
  });

  const toolBlock = message.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a structured plan");
  }

  return toolBlock.input as AnimationPlan;
}

export async function generateCode(
  plan: AnimationPlan,
  originalPrompt: string,
  style: StylePreset = "standard"
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16384,
    system: getCodeSystemPrompt(style),
    messages: [
      {
        role: "user",
        content: `Generate a complete Remotion animation component based on this plan.

Original request: "${originalPrompt}"

Plan:
${JSON.stringify(plan, null, 2)}

IMPORTANT: Return ONLY the TSX code. No markdown fences, no explanations, no comments before or after the code. Start with "import" and end with "};".`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  let code = content.text.trim();

  // Strip markdown fences if present despite instructions
  if (code.startsWith("```")) {
    code = code.replace(/^```(?:tsx?)?\n?/, "").replace(/\n?```$/, "");
  }

  return code;
}

export function streamPlan(prompt: string, style: StylePreset = "standard") {
  return client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create a detailed animation plan for:\n\n${prompt}`,
      },
    ],
  });
}

export function streamRevisePlan(
  originalPrompt: string,
  currentPlan: AnimationPlan,
  feedback: string,
  style: StylePreset = "standard"
) {
  return client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create a detailed animation plan for:\n\n${originalPrompt}`,
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "plan_1",
            name: "create_animation_plan",
            input: currentPlan as unknown as Record<string, unknown>,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "plan_1",
            content: "Plan received. The user has reviewed it and wants changes.",
          },
        ],
      },
      {
        role: "user",
        content: `Revise the animation plan based on this feedback:\n\n${feedback}\n\nReturn the complete updated plan with all fields.`,
      },
    ],
  });
}

export function streamCode(
  plan: AnimationPlan,
  originalPrompt: string,
  style: StylePreset = "standard"
) {
  return client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16384,
    system: getCodeSystemPrompt(style),
    messages: [
      {
        role: "user",
        content: `Generate a complete Remotion animation component based on this plan.

Original request: "${originalPrompt}"

Plan:
${JSON.stringify(plan, null, 2)}

IMPORTANT: Return ONLY the TSX code. No markdown fences, no explanations, no comments before or after the code. Start with "import" and end with "};".`,
      },
    ],
  });
}

export async function fixCode(
  code: string,
  errors: string,
  style: StylePreset = "standard"
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16384,
    system: getCodeSystemPrompt(style),
    messages: [
      {
        role: "user",
        content: `This Remotion component has TypeScript errors. Fix them and return ONLY the corrected TSX code. No markdown fences, no explanations.

Errors:
${errors}

Code:
${code}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  let fixed = content.text.trim();
  if (fixed.startsWith("```")) {
    fixed = fixed.replace(/^```(?:tsx?)?\n?/, "").replace(/\n?```$/, "");
  }

  return fixed;
}
