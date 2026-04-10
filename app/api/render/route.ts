import { NextRequest, NextResponse } from "next/server";
import { execSync, execFile } from "child_process";
import path from "path";
import fs from "fs";

const REMOTION_ROOT = path.resolve(process.cwd(), "remotion");
const OUT_DIR = path.join(REMOTION_ROOT, "out");

export async function POST(req: NextRequest) {
  try {
    const { compositionId } = await req.json();

    if (!compositionId || typeof compositionId !== "string") {
      return NextResponse.json({ error: "compositionId is required" }, { status: 400 });
    }

    const outputFile = path.join(OUT_DIR, `${compositionId}.mp4`);

    // Ensure output directory exists
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    // Run remotion render synchronously (can take 30-120s)
    execSync(
      `npx remotion render ${compositionId} out/${compositionId}.mp4`,
      {
        cwd: REMOTION_ROOT,
        encoding: "utf-8",
        timeout: 300000, // 5 minute timeout
        stdio: "pipe",
      }
    );

    if (!fs.existsSync(outputFile)) {
      return NextResponse.json({ error: "Render completed but output file not found" }, { status: 500 });
    }

    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

    return NextResponse.json({
      success: true,
      file: `/api/render?file=${compositionId}.mp4`,
      sizeMB,
    });
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; message?: string };
    const message = execError.stderr || execError.stdout || execError.message || "Render failed";
    console.error("Render error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");

  if (!file || file.includes("..") || !file.endsWith(".mp4")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const filePath = path.join(OUT_DIR, file);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
