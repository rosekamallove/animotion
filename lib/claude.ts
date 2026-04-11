import Anthropic from "@anthropic-ai/sdk";
import { getPlanSystemPrompt, getCodeSystemPrompt } from "./prompts";
import { StylePreset } from "./styles";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnimationPlan {
  sceneName: string;
  description: string;
  durationSeconds: number;
  fps: number;
  phases: Array<{
    name: string;
    startSecond: number;
    endSecond: number;
    description: string;
  }>;
}

const planTool = {
  name: "create_animation_plan" as const,
  description: "Create a shot list for a Remotion animation scene",
  input_schema: {
    type: "object" as const,
    properties: {
      sceneName: { type: "string" as const, description: "PascalCase component name (e.g. KVCacheExplainer)" },
      description: { type: "string" as const, description: "1-2 sentence summary of what the scene shows" },
      durationSeconds: { type: "number" as const, description: "Total duration in seconds" },
      fps: { type: "number" as const, description: "Frames per second (usually 30)" },
      phases: {
        type: "array" as const,
        description: "3-5 phases, each a single sentence of what the audience sees",
        items: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const, description: "Short label (e.g. 'Block Shrinks')" },
            startSecond: { type: "number" as const },
            endSecond: { type: "number" as const },
            description: { type: "string" as const, description: "One sentence: what the audience sees in this phase" },
          },
          required: ["name", "startSecond", "endSecond", "description"],
        },
      },
    },
    required: ["sceneName", "description", "durationSeconds", "fps", "phases"],
  },
};

function formatPlanForCodeGen(plan: AnimationPlan, originalPrompt: string): string {
  const totalFrames = plan.durationSeconds * plan.fps;
  const phases = plan.phases
    .map((p) => `[${p.startSecond}s - ${p.endSecond}s] ${p.name}: ${p.description}`)
    .join("\n");

  return `Generate a complete Remotion animation component. Use the creative direction below as loose guidance — you decide the implementation details. Feel free to add visual polish, adjust timing for flow, and choose animation approaches that look best.

Scene: "${plan.sceneName}" (${plan.durationSeconds}s at ${plan.fps}fps, ${totalFrames} frames)

Creative direction: ${plan.description}

Phases:
${phases}

Original request: "${originalPrompt}"

IMPORTANT: Return ONLY the TSX code. No markdown fences, no explanations, no comments before or after the code. Start with "import" and end with "};".`;
}

export async function generatePlan(prompt: string, style: StylePreset = "standard"): Promise<AnimationPlan> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0.7,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create an animation plan for:\n\n${prompt}`,
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
    temperature: 0.8,
    system: getCodeSystemPrompt(style),
    messages: [
      {
        role: "user",
        content: formatPlanForCodeGen(plan, originalPrompt),
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
    max_tokens: 4096,
    temperature: 0.7,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create an animation plan for:\n\n${prompt}`,
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
    max_tokens: 4096,
    temperature: 0.7,
    system: getPlanSystemPrompt(style),
    tools: [planTool],
    tool_choice: { type: "tool", name: "create_animation_plan" },
    messages: [
      {
        role: "user",
        content: `Create an animation plan for:\n\n${originalPrompt}`,
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
        content: `Revise the animation plan based on this feedback:\n\n${feedback}\n\nReturn the complete updated plan.`,
      },
    ],
  });
}

export function streamCode(
  plan: AnimationPlan,
  originalPrompt: string,
  style: StylePreset = "standard",
  videoContext?: string
) {
  const systemPrompt = videoContext
    ? `${getCodeSystemPrompt(style)}\n\n${videoContext}`
    : getCodeSystemPrompt(style);

  return client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16384,
    temperature: 0.8,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: formatPlanForCodeGen(plan, originalPrompt),
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
    temperature: 0.8,
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
