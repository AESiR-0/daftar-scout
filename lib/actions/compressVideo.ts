import { fetchFile } from "@ffmpeg/util";
import { supabaseClient } from "@/supabaseClient";

export const compressAndUploadVideo = async (
  inputBlob: Blob,
  supabasePath: string,
  onProgress: (ratio: number) => void
): Promise<{ data: any; error: any }> => {
  // @ts-expect-error – ffmpeg esm build has no types
  const { createFFmpeg } = await import("@ffmpeg/ffmpeg/dist/esm/index.js");
  const ffmpeg = createFFmpeg({
    log: true,
  });

  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  // Bind progress tracker
  (window as any).onFFmpegProgress = ({ ratio }: { ratio: number }) => {
    onProgress(ratio); // 0 to 1
  };

  const inputName = "input.mp4";
  const outputName = "output.mp4";

  ffmpeg.FS("writeFile", inputName, await fetchFile(inputBlob));

  await ffmpeg.run(
    "-i",
    inputName,
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    "-preset",
    "fast",
    "-acodec",
    "aac",
    outputName
  );

  const data = ffmpeg.FS("readFile", outputName);
  const compressedBlob = new Blob([data.buffer], { type: "video/mp4" });

  // Upload to Supabase Storage
  const { data: uploadedData, error } = await supabaseClient.storage
    .from("pitch-videos") // <-- Replace with your bucket name
    .upload(supabasePath, compressedBlob, {
      contentType: "video/mp4",
      upsert: true,
    });

  return { data: uploadedData, error };
};
