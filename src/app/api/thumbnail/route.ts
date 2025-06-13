import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing `url` query parameter" }, { status: 400 });
  }

  try {
    const stream = new PassThrough();

    await new Promise<void>((resolve, reject) => {
      ffmpeg(url)
        .inputOptions("-ss", "0.5")
        .frames(1)
        .outputOptions("-vf", "scale=320:180")
        .format("image2")
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .pipe(stream, { end: true });
    });

    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve());
      stream.on("error", (err) => reject(err));
    });

    const imageBuffer = Buffer.concat(chunks);

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 });
  }
}
