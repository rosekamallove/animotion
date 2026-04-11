import { NextRequest, NextResponse } from "next/server";
import { readVideos, createVideo, updateVideoScript } from "../../../lib/videos";
import type { StylePreset } from "../../../lib/styles";

export async function GET() {
  try {
    const data = readVideos();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read videos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, style } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Video name is required" }, { status: 400 });
    }

    const video = createVideo(name, (style as StylePreset) || "standard");
    return NextResponse.json(video, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create video";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { videoId, script } = await req.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    if (typeof script !== "string") {
      return NextResponse.json({ error: "script must be a string" }, { status: 400 });
    }

    const video = updateVideoScript(videoId, script);
    return NextResponse.json(video);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update video";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
