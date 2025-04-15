import { NextRequest, NextResponse } from "next/server";
// import ffmpegPath from "ffmpeg-static";
// import ffmpeg from "fluent-ffmpeg";
// import { tmpdir } from "os";
// import { join } from "path";
// import { writeFile, readFile, unlink } from "fs/promises";
// import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // const formData = await req.formData();
    // const file = formData.get("file") as File;
    // if (!file)
    //   return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // const scoutId = formData.get("scoutId") as string;
    // if (!scoutId)
    //   return NextResponse.json({ error: "Missing scoutId" }, { status: 400 });

    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // const inputPath = join(tmpdir(), `${randomUUID()}.mp4`);
    // const outputPath = join(tmpdir(), `${randomUUID()}-compressed.mp4`);

    // await writeFile(inputPath, buffer);

    // ffmpeg.setFfmpegPath(ffmpegPath!);

    // await new Promise((resolve, reject) => {
    //   ffmpeg(inputPath)
    //     .outputOptions([
    //       "-vcodec libx264",
    //       "-crf 28",
    //       "-preset fast",
    //       "-acodec aac",
    //     ])
    //     .on("end", resolve)
    //     .on("error", reject)
    //     .save(outputPath);
    // });

    // const compressedBuffer = await readFile(outputPath);

    // await unlink(inputPath);
    // await unlink(outputPath);

    // // Return the compressed file as base64 or blob for client to upload
    // const base64 = compressedBuffer.toString("base64");

    return NextResponse.json({
      // file: base64,
      // scoutId,
      // originalName: file.name,
      status: 200,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
