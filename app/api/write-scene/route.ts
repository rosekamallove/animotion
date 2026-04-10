import { NextRequest, NextResponse } from "next/server";
import { writeScene, validateTypeScript } from "../../../lib/remotion-writer";
import { fixCode } from "../../../lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { sceneName, code, durationFrames, fps, style } = await req.json();

    if (!sceneName || !code || !durationFrames) {
      return NextResponse.json(
        { error: "sceneName, code, and durationFrames are required" },
        { status: 400 }
      );
    }

    // Write the scene
    const { scenePath } = writeScene(sceneName, code, durationFrames, fps || 30);

    // Validate TypeScript
    let validation = validateTypeScript();

    // If TypeScript fails, attempt one fix
    if (!validation.success) {
      console.log("TypeScript validation failed, attempting fix...");
      const fixedCode = await fixCode(code, validation.errors, style || "standard");

      // Rewrite with fixed code
      writeScene(sceneName, fixedCode, durationFrames, fps || 30);

      // Validate again
      validation = validateTypeScript();

      if (!validation.success) {
        return NextResponse.json({
          success: false,
          scenePath,
          error: "TypeScript errors remain after auto-fix attempt",
          tsErrors: validation.errors,
          code: fixedCode,
        });
      }

      return NextResponse.json({
        success: true,
        scenePath,
        fixed: true,
        code: fixedCode,
      });
    }

    return NextResponse.json({
      success: true,
      scenePath,
      fixed: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to write scene";
    console.error("Write scene error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
