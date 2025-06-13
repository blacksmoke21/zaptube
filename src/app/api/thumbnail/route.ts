import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
}

function getThumbnailBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    ffmpeg(url)
      .inputOptions("-ss", "0.5")
      .frames(1)
      .outputOptions("-vf", "scale=320:180")
      .format("image2")
      .on("error", reject)
      .on("end", () => {
        resolve(Buffer.concat(chunks));
      })
      .pipe(stream, { end: true });

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing `url`" }, { status: 400 });
  }

  try {
    const [duration, thumbBuffer] = await Promise.all([getVideoDuration(url), getThumbnailBuffer(url)]);

    const base64 = `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
    return NextResponse.json({ duration, thumbnail: base64 });
  } catch (error) {
    console.error("Thumbnail/duration error:", error);
    return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 });
  }
}
