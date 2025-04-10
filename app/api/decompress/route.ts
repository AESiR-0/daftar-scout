// app/api/decompress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import { Readable } from "stream";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false, // We handle raw body for large files
  },
};

export async function GET(req: NextRequest) {
  const videoUrl = new URL(req.url).searchParams.get("videoUrl");

  if (!videoUrl) {
    return new NextResponse("No video URL provided", { status: 400 });
  }

  try {
    // Step 1: Fetch the compressed video from Supabase
    const videoResponse = await fetch(videoUrl as string);
    const video = await videoResponse.arrayBuffer();
    const compressedVideoBuffer = Buffer.from(video);

    // Step 2: "Decompress" (re-encode) the video in memory
    const decompressedBuffer = await decompressVideo(compressedVideoBuffer);

    // Step 3: Return the decompressed video as a stream for playback
    return new NextResponse(decompressedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": decompressedBuffer.length.toString(),
      },
    });
  } catch (err) {
    return new NextResponse(`Error`, { status: 500 });
  }
}

// Function to re-encode the compressed video buffer (simulate decompression)
async function decompressVideo(compressedVideoBuffer: Buffer) {
  const compressedStream = new Readable();
  compressedStream.push(compressedVideoBuffer);
  compressedStream.push(null);

  const decompressedBuffer: Buffer[] = [];

  // Re-encode the video to a higher bitrate or quality using FFmpeg
  const ffmpeg = exec("ffmpeg -i pipe:0 -b:v 2M -f mp4 pipe:1");
  if (!ffmpeg.stdout || !ffmpeg.stdin) {
    throw new Error("FFmpeg streams are not properly initialized");
  }
  ffmpeg.stdout.on("data", (chunk) => {
    decompressedBuffer.push(chunk);
  });

  ffmpeg.on("close", () => {
    const finalBuffer = Buffer.concat(decompressedBuffer);
    return finalBuffer;
  });

  compressedStream.pipe(ffmpeg.stdin);

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error("FFmpeg process failed"));
      } else {
        resolve(Buffer.concat(decompressedBuffer));
      }
    });
  });
}
