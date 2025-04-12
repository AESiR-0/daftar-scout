"use client";
import { useState } from "react";
import { compressAndUploadVideo } from "@/lib/actions/compressVideo";

export default function VideoUpload() {
  const [progress, setProgress] = useState(0);
  const [uploadInfo, setUploadInfo] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await compressAndUploadVideo(
      file,
      `compressed/${Date.now()}-${file.name}`,
      (ratio) => setProgress(Math.floor(ratio * 100))
    );

    setUploadInfo({ data, error });
  };

  return (
    <div className="p-4">
      <input type="file" accept="video/mp4" onChange={handleUpload} />
      <div className="mt-2">Progress: {progress}%</div>

      {uploadInfo?.data && (
        <p className="mt-2 text-green-600">
          ✅ Uploaded: {uploadInfo.data.path}
        </p>
      )}

      {uploadInfo?.error && (
        <p className="mt-2 text-red-500">
          ❌ Error: {uploadInfo.error.message}
        </p>
      )}
    </div>
  );
}
