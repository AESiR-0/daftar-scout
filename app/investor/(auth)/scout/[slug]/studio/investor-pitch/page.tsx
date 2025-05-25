"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Play, Upload, Trash2, Video, Info, X, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadInvestorsPitchVideo } from "@/lib/actions/video";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";

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

  async function fetchInvestorsPitch() {
    const res = await fetch(
      `/api/endpoints/scouts/investor_pitch?scoutId=${scoutId}`
    );
    if (res.status == 200) {
      const { url } = await res.json();
      setVideoUrl(url);
      console.log(url);
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
        const res = await fetch(`/api/endpoints/scouts/investor-pitch?scoutId=${scoutId}`);
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

    try {
      const url = await uploadInvestorsPitchVideo(
        file,
        scoutId,
        (progress) => {
          setUploadProgress(progress);
          // Update status message based on progress
          if (progress <= 0.3) {
            setUploadStatus("Compressing video...");
          } else if (progress <= 0.5) {
            setUploadStatus("Authenticating...");
          } else if (progress <= 0.8) {
            setUploadStatus("Uploading to server...");
          } else {
            setUploadStatus("Finalizing...");
          }
        }
      );

      const res2 = await fetch("/api/endpoints/scouts/investor_pitch", {
        method: "POST",
        body: JSON.stringify({ scoutId, videoUrl: url }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res2.status === 200) {
        toast({
          title: "Video uploaded",
          description: "Your pitch video has been uploaded successfully",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Could not update pitch in database.",
          variant: "destructive",
        });
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
      setUploadStatus("");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/endpoints/scouts/investor-pitch", {
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
    <Card className="border-none mt-4 container mx-auto px-4 bg-[#0e0e0e]">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Section: Video Upload */}
          <div className="col-span-2 ">
            <div className="space-y-4">
              {showSample ? (
                <div className="border-2 flex flex-col items-center justify-center border-dashed border-gray-700 rounded-lg p-6">
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    

                    <ReactPlayer
                      url={videoUrl || "/dummyVideo.mp4"}
                      controls
                      width="300px"
                      height="533px"
                      style={{
                        borderRadius: "0.35rem",
                        aspectRatio: "16/9",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 flex flex-col min-h-[533px] items-center justify-center border-dashed border-gray-700 rounded-lg p-6 text-center">
                  {videoUrl ? (
                    <div className="space-y-4">
                      <ReactPlayer
                        url={videoUrl}
                        controls
                        width="300px"
                        height="533px"
                        style={{
                          borderRadius: "0.35rem",
                          aspectRatio: "16/9",
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearVideo}
                          className="w-full"
                          disabled={isUploading || isLocked}
                        >
                          Remove Video
                        </Button>
                        <Button
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
      </CardContent>
    </Card>
  );
}
