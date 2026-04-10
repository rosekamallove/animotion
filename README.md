# Animotion

Describe an animation in plain English. Get a production-ready Remotion scene.

Animotion uses Claude to generate React-based video animations from natural language prompts. You describe what you want, review a structured plan, approve it, and get a working `.tsx` component written to disk — registered and ready to preview in Remotion Studio.

**BYOK** — Bring Your Own Key. You need an Anthropic API key.

## How it works

```
You describe it  →  Claude plans it  →  You approve  →  Claude codes it  →  File written  →  Preview in Remotion
```

1. Type a prompt like *"Show a KV cache filling up and overflowing with a red shake effect"*
2. Claude generates a structured plan (phases, timing, visual elements)
3. You review and approve the plan
4. Claude (Opus) generates the full TSX component
5. The file is saved to `remotion/src/generated/`, Root.tsx is auto-updated
6. Open Remotion Studio to preview, or render to MP4

## Setup

```bash
# Clone
git clone <your-repo-url> animotion
cd animotion

# Install web app dependencies
npm install

# Install Remotion dependencies
cd remotion && npm install && cd ..

# Add your Anthropic API key
cp .env.local.example .env.local
# Edit .env.local and add your key
```

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

**Start the web app:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Describe your animation, review the plan, and approve.

**Preview generated scenes:**

```bash
cd remotion
npx remotion studio
```

Your scene appears in the "Generated" folder in the sidebar.

**Render to MP4:**

```bash
cd remotion
npx remotion render <SceneName> out/<SceneName>.mp4
```

**Render at 4K:**

```bash
npx remotion render <SceneName> out/<SceneName>.mp4 --scale=2
```

## Project structure

```
animotion/
  app/                  # Next.js app (UI + API routes)
    api/
      generate-plan/    # POST: prompt → structured plan (Sonnet)
      generate-code/    # POST: plan → TSX code (Opus)
      write-scene/      # POST: writes file, updates Root.tsx, validates TS
  lib/
    claude.ts           # Anthropic SDK wrapper
    prompts.ts          # System prompts with Remotion patterns + examples
    remotion-writer.ts  # File writer + Root.tsx auto-registration
  remotion/             # Remotion project
    src/
      Root.tsx           # Composition registry (auto-modified)
      generated/         # AI-generated scenes land here
      TurboQuant/        # Example hand-crafted scenes for reference
  .env.local            # Your API key (not committed)
```

## Models used

| Step | Model | Why |
|------|-------|-----|
| Planning | claude-sonnet-4-6 | Fast structured output via tool_use |
| Code generation | claude-opus-4-6 | Best code quality, understands complex layouts |
| Auto-fix | claude-opus-4-6 | Fixes TypeScript errors if first pass fails |

## What makes the output good

The system prompt includes:
- Two complete, production-quality example scenes as few-shot references
- Remotion-specific rules (no CSS animations, spring/interpolate only, useCurrentFrame)
- The exact color palette, glass-morphism styles, and grid background
- Design principles learned from iteration (no emojis, no gradient text, solid colors, bouncy springs for impact)

## Tips for good prompts

**Be specific about the visual:**
> "Show 8 horizontal bars stacking up, each with a cyan dot and purple dot, filling a GPU memory thermometer that turns red when full"

**Not:**
> "Show memory growing"

**Mention timing:**
> "10-second scene, bars appear in the first 3 seconds, overflow happens at 6 seconds"

**Reference interaction types:**
> "bouncy pop-in for the cards, smooth fade for text, shake effect when it overflows"

## Requirements

- Node.js 18+
- An Anthropic API key with access to Claude Opus 4.6
