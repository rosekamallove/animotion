import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GENERATED_DIR = path.resolve(process.cwd(), "remotion", "src", "generated");

export async function GET(req: NextRequest) {
  try {
    const sceneName = req.nextUrl.searchParams.get("name");

    if (!sceneName) {
      return NextResponse.json({ error: "Scene name is required" }, { status: 400 });
    }

    const filePath = path.join(GENERATED_DIR, `${sceneName}.tsx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const code = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ name: sceneName, code });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read scene";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
