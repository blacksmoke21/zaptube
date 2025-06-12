import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing `url` query parameter" }, { status: 400 });
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "thumb-"));
  const outputPath = path.join(tempDir, "thumbnail.jpg");

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(url)
        .inputOptions("-ss", "0.5") // Seek to 0.5s for safety
        .frames(1)                  // Only 1 frame
        .outputOptions("-vf", "scale=320:180") // Fixed small thumbnail size (16:9)
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const imageBuffer = fs.readFileSync(outputPath);
    fs.rmSync(tempDir, { recursive: true, force: true });

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    fs.rmSync(tempDir, { recursive: true, force: true });
    return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 });
  }
}
