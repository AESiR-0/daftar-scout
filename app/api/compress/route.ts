import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ffmpeg from "fluent-ffmpeg";

// Initialize Supabase client
const supabase = createClient(
  "https://yvaoyubwynyvqfelhzcd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YW95dWJ3eW55dnFmZWxoemNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDEyMzIsImV4cCI6MjA1OTYxNzIzMn0.V4-TQm-R5HUyLUBIu4uBKzYXAUpHvE7YALkGhGeQx_M"
);

// Set the config for your Next.js API
export const config = {
  api: {
    bodyParser: true,
  },
};

// Compression function
export async function POST(req: NextRequest) {
  const { videoUrl } = await req.json();

  if (!videoUrl) {
    return new NextResponse("No video URL provided", { status: 400 });
  }

  try {
    // Step 1: Fetch the video file (or provide a direct link)
    const videoResponse = await fetch(videoUrl);
    const vid = await videoResponse.arrayBuffer();
    const videoBuffer = Buffer.from(vid);
    console.log("here 0");

    // Step 2: Compress the video with FFmpeg
    const compressedVideoBuffer = await compressVideo(videoBuffer);
    console.log("here");

    // Step 3: Upload compressed video to Supabase storage
    const { data, error } = await supabase.storage
      .from("videos") // Replace with your bucket name
      .upload(
        `compressed/${Date.now()}_compressed.mp4`,
        compressedVideoBuffer,
        {
          contentType: "video/mp4",
        }
      );
    console.log("here 2");

    if (error) {
      return new NextResponse(
        `Error uploading compressed video: ${error.message}`,
        { status: 500 }
      );
    }

    // Step 4: Generate the public URL for the compressed video
    const publicUrl = supabase.storage
      .from("videos")
      .getPublicUrl(data.path).publicURL;

    return new NextResponse(
      JSON.stringify({
        message: "Video compressed successfully",
        compressedVideoUrl: publicUrl,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(`Error`, { status: 500 });
  }
}

// Video compression logic using FFmpeg
function compressVideo(videoBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = ffmpeg()
      .input(videoBuffer)
      .inputFormat("mp4")
      .outputOptions("-vcodec", "libx264", "-crf", "28") // CRF value controls compression (lower = better quality)
      .outputFormat("mp4")
      .on("end", () => {
        console.log("Compression finished.");
      })
      .on("error", (err: any) => {
        console.error("Error during compression:", err);
        reject(err);
      })
      .pipe();

    const chunks: Buffer[] = [];
    ffmpegProcess.on("data", (chunk) => {
      chunks.push(chunk);
    });

    ffmpegProcess.on("end", () => {
      const compressedBuffer = Buffer.concat(chunks);
      resolve(compressedBuffer); // Return the compressed video as Buffer
    });
  });
}
