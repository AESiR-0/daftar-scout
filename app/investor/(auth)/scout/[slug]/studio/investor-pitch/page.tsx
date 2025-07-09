"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Play, Upload, Trash2, Video, Info, X, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";
import VideoStreamer from "@/components/VideoStreamer";

const LANGUAGES = {
  indian: [
    { value: "hindi", label: "Hindi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "marathi", label: "Marathi" },
    { value: "bengali", label: "Bengali" },
    { value: "gujarati", label: "Gujarati" },
    { value: "punjabi", label: "Punjabi" },
    { value: "odia", label: "Odia" },
    { value: "assamese", label: "Assamese" },
    { value: "urdu", label: "Urdu" },
  ],
  international: [
    { value: "english", label: "English" },
    { value: "mandarin", label: "Mandarin" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" },
  ],
};

function useCompressionLogs(jobId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!jobId) return;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_SERVER || "ws://localhost:4000");
    ws.onopen = () => ws.send(JSON.stringify({ subscribe: true, jobId }));
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data.log]);
      if (data.done) setDone(true);
    };
    return () => ws.close();
  }, [jobId]);
  return { logs, done };
}

// Helper to split file into chunks
function splitFileIntoChunks(file: File, chunkCount: number) {
  const chunkSize = Math.ceil(file.size / chunkCount);
  const chunks = [];
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
  }
  return chunks;
}

export default function InvestorPitchPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [showSample, setShowSample] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [pitchName, setPitchName] = useState("");
  const [pitchDescription, setPitchDescription] = useState("");
  const [pitchProblem, setPitchProblem] = useState("");
  const [pitchSolution, setPitchSolution] = useState("");
  const [pitchValue, setPitchValue] = useState("");
  const [compressedVideoUrl, setCompressedVideoUrl] = useState<string | null>(null);
  const [compressionJobId, setCompressionJobId] = useState<string | null>(null);
  const { logs: compressionLogs, done: compressionDone } = useCompressionLogs(compressionJobId);

  async function fetchInvestorsPitch() {
    const res = await fetch(
      `/api/endpoints/scouts/investor_pitch?scoutId=${scoutId}`
    );
    if (res.status == 200) {
      const { url, compressedUrl } = await res.json();
      setVideoUrl(url);
      setCompressedVideoUrl(`https://d2nq6gsuamvat4.cloudfront.net/${compressedUrl.split('.com/')[1]}`);
    } else {
      toast({
        title: "Fetch Failed",
        description: "Failed to get the investor's pitch",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchInvestorsPitch();
  }, []);

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

  useEffect(() => {
    const fetchPitchDetails = async () => {
      try {
        const res = await fetch(`/api/endpoints/scouts/investor_pitch?scoutId=${scoutId}`);
        if (!res.ok) throw new Error("Failed to fetch pitch details");
        const data = await res.json();
        setPitchName(data.pitchName || "");
        setPitchDescription(data.pitchDescription || "");
        setPitchProblem(data.pitchProblem || "");
        setPitchSolution(data.pitchSolution || "");
        setPitchValue(data.pitchValue || "");
      } catch (error) {
        console.error("Error fetching pitch details:", error);
      }
    };

    fetchPitchDetails();
  }, [scoutId]);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const clearVideo = () => {
    setVideoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadVideo = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Starting upload...");

    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const totalChunks = 4;
    const chunks = splitFileIntoChunks(file, totalChunks);

    try {
      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData();
        formData.append('chunk', chunks[i]);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('filename', file.name);
        formData.append('scoutId', scoutId);
        formData.append('pitchType', 'investor');
        formData.append('pitchId', scoutId); // If you have a separate pitchId, use it

        const res = await fetch('http://localhost:9898/upload-chunk', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Chunk ${i + 1} upload failed`);
        setUploadProgress(((i + 1) / totalChunks) * 100);
        setUploadStatus(`Uploaded chunk ${i + 1} of ${totalChunks}`);
      }

      setUploadStatus("All chunks uploaded. Video is being processed...");

      // Poll for compression completion and refetch pitch info for CloudFront HLS URL
      let pollCount = 0;
      let compressedUrl = null;
      while (pollCount < 30) { // up to 1 minute
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`/api/endpoints/scouts/investor_pitch?scoutId=${scoutId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.compressedUrl) {
            compressedUrl = data.compressedUrl;
            break;
          }
        }
        pollCount++;
      }
      if (compressedUrl) {
        setCompressedVideoUrl(compressedUrl);
        setUploadStatus("Compression complete!");
      } else {
        setUploadStatus("Compression in progress. Please refresh later.");
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // setUploadStatus("");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/endpoints/scouts/investor_pitch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoutId,
          pitchName,
          pitchDescription,
          pitchProblem,
          pitchSolution,
          pitchValue,
        }),
      });

      if (!res.ok) throw new Error("Failed to save pitch details");

      toast({
        title: "Success",
        description: "Pitch details saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pitch details",
        variant: "destructive",
      });
    }
  };

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card className="border-none min-h-screen  container mx-auto px-4 bg-[#0e0e0e]">
      <CardContent className="py-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Section: Video Upload */}
          <div className="col-span-2 ">
            <div className="space-y-4">
              {showSample ? (
                <div className="border-2 flex flex-col items-center justify-center border-dashed border-gray-700 rounded-lg p-3">
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    {compressedVideoUrl && compressedVideoUrl.endsWith('.m3u8') ? (
                      <ReactPlayer url={compressedVideoUrl} controls width="100%" height="auto" config={{ file: { forceHLS: true } }} />
                    ) : videoUrl && videoUrl.endsWith('.m3u8') ? (
                      <ReactPlayer url={videoUrl} controls width="100%" height="auto" config={{ file: { forceHLS: true } }} />
                    ) : (
                      <VideoStreamer src={compressedVideoUrl || videoUrl || "/dummyVideo.mp4"} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 flex flex-col min-h-[533px] items-center justify-center border-dashed border-gray-700 rounded-lg p-6 text-center">
                  {videoUrl ? (
                    <div className="space-y-4">
                      {videoUrl.endsWith('.m3u8') ? (
                        <ReactPlayer url={videoUrl} controls width="100%" height="auto" config={{ file: { forceHLS: true } }} />
                      ) : (
                        <VideoStreamer src={videoUrl} />
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearVideo}
                          type="button"
                          className="w-full"
                          disabled={isUploading || isLocked}
                        >
                          Remove Video
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUploadVideo}
                          className="w-full"
                          disabled={isUploading || isLocked}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              Upload Video
                            </>
                          )}
                        </Button>
                      </div>
                      {isUploading && (
                        <div className="w-full space-y-2">
                          <Progress value={uploadProgress * 100} className="w-full" />
                          <p className="text-sm text-gray-500">{uploadStatus}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={handleUpload}
                      className="cursor-pointer  space-y-4"
                    >
                      <div className="flex h-72 justify-evenly flex-col ">
                        <div className="flex flex-col gap-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Video className="h-6 w-6 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium">
                            Upload your pitch video
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs flex flex-col   text-gray-500">
                            <span>
                              MP4, WebM, MOV or Ogg
                              The max file size is 50MB. <br /> <br /> Compress your video before uploading.
                              You can compress your video <Link href={"https://www.freeconvert.com/video-compressor"} target="_blank" className="text-blue-500">here {" "}</Link>
                              or use any other video compressor.
                            </span>
                            <br />
                          </p>
                        </div>
                        <span className="text-xs justify-self-end  text-gray-500">
                          (Please note that we are not affiliated with freeconvert.com and we are not responsible for any issues that may occur while using their service or any other video compressor.)
                        </span>

                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <Button
                variant="outline"
                className="w-full rounded-[0.3rem]"
                onClick={() => setShowSample(!showSample)}
                disabled={isUploading || isLocked}
              >
                {showSample ? "Upload Your Pitch" : "Back to Sample"}
              </Button>
            </div>
          </div>
          {/* Right Section: Info */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your investment is more than just money, and your story with
                  the founders is more than a pitch. Share your vision to
                  connect with founders who align with your values.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A simple message about your 'why' can help you connect with
                  founders who share your values and are building a similar
                  future.
                </p>
              </div>
            </div>

          </div>
        </div>
        {compressionJobId && (
          <div className="mt-4 p-2 bg-gray-900 rounded text-xs max-h-48 overflow-auto">
            <div className="font-bold mb-1">Compression Logs</div>
            <pre>{compressionLogs.join("\n")}</pre>
            {compressionDone ? <div className="text-green-500">Compression complete!</div> : <div className="text-yellow-500">Compressing...</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
