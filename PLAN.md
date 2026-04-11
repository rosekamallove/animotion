# Animotion — Development Plan

## Project Context

Animotion is an AI-powered Remotion animation generator. Users describe animations in plain English, Claude generates a plan, the user reviews/edits, Claude generates production-ready TSX code, and the scene is written to disk ready for preview and render.

**Current state:** The core pipeline works — prompt → plan → code → write. The web UI at `app/page.tsx` has a 5-state flow (idle → planning → reviewing → generating → done). Code gen uses Claude Opus 4.6 with two real scene examples in the system prompt. Generated scenes go to `remotion/src/generated/`.

**Repo:** https://github.com/rosekamallove/animotion.git

**Directory structure:**
```
animotion/
  app/                  # Next.js routes + API
    api/
      generate-plan/    # POST: prompt → plan (Sonnet, tool_use)
      generate-code/    # POST: plan → TSX (Opus)
      write-scene/      # POST: writes file, validates TS, auto-fixes
  lib/
    claude.ts           # Anthropic SDK wrapper (generatePlan, generateCode, fixCode)
    prompts.ts          # PLAN_SYSTEM_PROMPT + CODE_SYSTEM_PROMPT
    remotion-writer.ts  # writeScene(), updateRootTsx(), validateTypeScript()
  remotion/             # Self-contained Remotion project
    src/
      Root.tsx          # Auto-modified with ANIMOTION marker comments
      generated/        # AI-generated scenes + manifest.json
      TurboQuant/       # Hand-crafted example scenes
  .env.local            # ANTHROPIC_API_KEY
```

**Key files:**
- `lib/claude.ts` — Plan uses Sonnet via tool_use for structured JSON. Code gen + fix use Opus with max_tokens 16384.
- `lib/prompts.ts` — CODE_SYSTEM_PROMPT has two full example scenes (CompressionImpact, KVPairVisual), inline theme/colors/glass, animation patterns, and design principles.
- `lib/remotion-writer.ts` — Uses `ANIMOTION_IMPORTS_START/END` and `ANIMOTION_COMPOSITIONS_START/END` marker comments in Root.tsx. Maintains `manifest.json` for tracking scenes. Runs `npx tsc --noEmit` for validation.
- `app/page.tsx` — Single-page state machine with states: idle, planning, reviewing, generating, writing, done, error.

---

## Phase 1: Style Guides (Light Theme)

### Goal
Add three hard-coded style presets that the user selects before generating. These affect both the plan and code system prompts — colors, fonts, card styles, background, animation feel.

### Style Presets

**1. Professional**
- White background (#ffffff), dark text (#0f172a)
- Blue primary (#2563eb), subtle shadows
- Inter font throughout, clean glass cards
- Smooth springs only (damping: 200), no bouncy effects
- Minimal decorative elements, data-focused

**2. Playful**
- Light warm background (#fefce8 or #fdf4ff)
- Vibrant colors — pink (#ec4899), orange (#f97316), teal (#14b8a6)
- Rounded corners (24px), thick borders, larger fonts
- Bouncy springs everywhere (damping: 8-12)
- Fun entrance effects, scale pops, rotation

**3. Standard** (current dark theme, renamed)
- Black background (#000000), cyan/purple accents
- Glass-morphism cards, grid overlay
- Mix of bouncy and smooth springs
- The current look from all TurboQuant scenes

### Implementation
- Create `lib/styles.ts` with three preset objects (colors, glass, background, fonts, spring configs, design rules as text)
- Update `lib/prompts.ts` — both PLAN and CODE system prompts accept a style parameter and inject the matching preset's colors/rules/examples
- Update `app/page.tsx` — add a style selector (3 cards/buttons) in the idle state before the prompt textarea
- Pass selected style through API calls: `generate-plan` and `generate-code`
- All three presets use LIGHT backgrounds (Standard switches from dark to light variant)

### Files to modify
- `lib/styles.ts` (NEW)
- `lib/prompts.ts`
- `lib/claude.ts`
- `app/api/generate-plan/route.ts`
- `app/api/generate-code/route.ts`
- `app/page.tsx`

---

## Phase 2: Plan Review Pipeline

### Goal
After the plan is generated, the user can submit text feedback (not just approve/reject). The planner takes the feedback and updates the plan accordingly. This loop can repeat until the user approves.

### Implementation
- In the "reviewing" state, add a textarea below the plan: "Suggest changes..."
- New button: "Revise Plan" (alongside "Approve")
- "Revise Plan" sends the current plan + user feedback back to the plan API
- New API route or extend `generate-plan` to accept an existing plan + revision notes
- Claude regenerates the plan incorporating the feedback
- The reviewing state refreshes with the updated plan
- User can revise multiple times before approving

### Files to modify
- `app/page.tsx` — add feedback textarea + revise button in reviewing state
- `app/api/generate-plan/route.ts` — accept optional `currentPlan` + `feedback` params
- `lib/claude.ts` — add `revisePlan(currentPlan, feedback, originalPrompt)` function

---

## Phase 3: In-Browser Preview

### Goal
After a scene is generated and written, preview it directly in the web app using `@remotion/player` instead of opening Remotion Studio separately.

### Approach
This is the hardest phase. The challenge is that `@remotion/player` needs to import the generated component, but Next.js and Remotion have separate webpack pipelines.

**Option A (recommended for POC):** Use an iframe pointing to Remotion Studio's dev server. The web app auto-opens `http://localhost:3001/?composition=<SceneName>` in an embedded iframe after writing the scene. Requires Remotion Studio running in parallel.

**Option B (stretch):** Bundle @remotion/player into the Next.js app with webpack aliases. Dynamic import of generated components. More complex but fully self-contained.

### Files to create/modify
- `app/page.tsx` — add iframe or Player component in done state
- Potentially `next.config.ts` for webpack aliases (Option B)

---

## Phase 4: Video Rendering

### Goal
Add "Render" buttons in the UI to render the generated scene to MP4 at 1080p or 4K.

### Implementation
- New API route: `app/api/render/route.ts`
- Accepts: compositionId, scale (1 for 1080p, 2 for 4K)
- Shells out: `npx remotion render <id> out/<id>.mp4 --scale=<scale>` in the remotion dir
- Returns the output file path when complete
- UI: Two buttons in done state — "Render 1080p" and "Render 4K"
- Show a progress/loading state during render (can take minutes for 4K)
- Serve the rendered file for download via a static file route or stream

### Files to create/modify
- `app/api/render/route.ts` (NEW)
- `app/page.tsx` — add render buttons + download link in done state

---

## Phase 5: State Persistence

### Goal
If code generation fails, the browser crashes, or the user refreshes, they shouldn't lose their prompt, plan, or selected style. Currently everything lives in React state and is gone on refresh.

### Approach
Use `sessionStorage` (per-tab, clears on tab close) to persist the working session:
- On every state change, save a snapshot: `{ state, style, prompt, plan, code, error }`
- On mount, check for a saved snapshot and restore it
- Clear storage on explicit "Start Over" or successful completion
- This means: if code gen fails → refresh → you're back in the reviewing state with your plan intact

### What to persist
| Field | Storage | Restore to |
|-------|---------|------------|
| `state` | sessionStorage | Current step (skip planning/generating — go to idle or reviewing) |
| `style` | sessionStorage | Style selector |
| `prompt` | sessionStorage | Prompt textarea |
| `plan` | sessionStorage | Plan object (if reviewing/generating/done) |
| `code` | sessionStorage | Generated code (if done) |
| `duration`, `fps` | sessionStorage | Parameter inputs |

### Edge cases
- If restored state is `planning` or `generating` (mid-stream), snap back to `idle` or `reviewing` respectively — don't try to resume a stream
- If restored state is `writing`, snap to `reviewing` with the plan (write is fast, user can re-approve)
- `error` state restores as-is so the user can see what failed

### Files to modify
- `app/page.tsx` — add `useEffect` for save/restore, wrap state setters

---

## Phase 6: Videos — Shared Context + Sidebar Layout + Scripts

### Goal
Create videos (series of related animations) where every scene shares the same design language. Each video has an optional full script/narrative. Each new scene sees code from previous scenes via a rolling window, plus the video script for narrative context.

### Layout
Sidebar (280px) + main area. Sidebar shows videos with collapsible scene lists, "+ New Scene" / "+ New Video" buttons. Main area shows: welcome, video overview (with script editor), scene preview, or the creation flow depending on selection.

### Data Model
`remotion/src/generated/videos.json` stores videos with their scenes and scripts. Files stay flat in `generated/`. Root.tsx registers video scenes in `<Folder name={videoName}>`.

```json
{
  "videos": [
    { "id": "turbo-quant", "name": "TurboQuant", "style": "standard", "script": "...", "scenes": [...] }
  ],
  "standalone": [...]
}
```

### Context Passing (Rolling Window + Script)
- Video script is always included in context (if set)
- Scene 1: Video script only (no prior scene context)
- Scene 2: Video script + full code of Scene 1
- Scene 3: Video script + full code of Scenes 1 + 2
- Scene 4+: Video script + full code of N-2 and N-1, older scenes as summaries (name + description)

Injected as `## VIDEO CONTEXT` section in the code system prompt with instruction to match design language and fit the narrative.

### Files
- `lib/videos.ts` — types (Video, VideoScene, VideosData), CRUD, context reader with script support
- `app/api/videos/route.ts` — GET (list), POST (create), PATCH (update script)
- `app/api/scene-code/route.ts` — GET scene code by name
- `app/components/Sidebar.tsx` — video/scene navigation
- `app/components/SceneCreator.tsx` — extracted creation flow from page.tsx
- `app/components/SceneViewer.tsx` — preview existing scene
- `app/components/VideoOverview.tsx` — video details, script editor, scene list
- `app/page.tsx` — sidebar + main area coordinator
- `lib/remotion-writer.ts` — video-aware writeScene, Root.tsx folders
- `lib/claude.ts` — pass videoContext to streamCode
- `app/api/generate-code/route.ts` — accept videoId, read context
- `app/api/write-scene/route.ts` — accept videoId

---

## Implementation Order

1. **Phase 1: Style Guides** ✅
2. **Phase 2: Plan Review** ✅
3. **Phase 3: In-Browser Preview** ✅
4. **Phase 4: Rendering (1080p)** ✅
5. **Phase 5: State Persistence** ✅
6. **Phase 6: Videos** ✅
