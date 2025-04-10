// app/api/video-handler/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as util from "util";
import { exec } from "child_process";
import { Readable } from "stream";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const execPromise = util.promisify(exec);

export const config = {
  api: {
    bodyParser: false, // We handle raw body for large files
  },
};

export async function POST(req: NextRequest) {
  const { videoUrl } = await req.json();

  if (!videoUrl) {
    return new NextResponse("No video URL provided", { status: 400 });
  }

  try {
    // Step 1: Download video from the URL
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer(); // Use .arrayBuffer() in Node.js
    const videoData = Buffer.from(videoBuffer); // Convert to Node.js Buffer

    // Step 2: Compress the video in memory
    const compressedBuffer = await compressVideo(videoData);

    // Step 3: Upload the compressed video to Supabase (storing only the compressed video URL)
    const compressedFileName = `compressed_${Date.now()}.mp4`;
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(`compressed/${compressedFileName}`, compressedBuffer, {
        contentType: "video/mp4",
      });

    if (error) {
      return new NextResponse("Error uploading compressed video", {
        status: 500,
      });
    }

    // Step 4: Return the compressed video URL
    const compressedVideoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/videos/compressed/${compressedFileName}`;

    return new NextResponse(
      JSON.stringify({
        message: "Video uploaded and compressed successfully",
        compressedVideoUrl,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse(`Error`, { status: 500 });
  }
}

// Function to compress video buffer in memory
async function compressVideo(videoBuffer: Buffer) {
  const videoStream = new Readable();
  videoStream.push(videoBuffer);
  videoStream.push(null);

  const compressedVideoBuffer: Buffer[] = [];

  // Compress the video using FFmpeg
  const ffmpeg = exec("ffmpeg -i pipe:0 -vcodec libx264 -crf 28 -f mp4 pipe:1");
  if (!ffmpeg.stdout || !ffmpeg.stdin) {
    throw new Error("FFmpeg streams are not properly initialized");
  }

  ffmpeg.stdout.on("data", (chunk) => {
    compressedVideoBuffer.push(chunk);
  });

  ffmpeg.on("close", () => {
    const compressedBuffer = Buffer.concat(compressedVideoBuffer);
    return compressedBuffer; // Return the compressed buffer
  });

  videoStream.pipe(ffmpeg.stdin);

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error("FFmpeg process failed"));
      } else {
        resolve(Buffer.concat(compressedVideoBuffer));
      }
    });
  });
}
