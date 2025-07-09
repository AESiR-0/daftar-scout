"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { Upload, Video, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  uploadAnswersPitchVideo,
} from "@/lib/actions/video";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useIsLocked } from "@/contexts/isLockedContext";
import VideoStreamer from "@/components/VideoStreamer";
import ReactPlayer from "react-player";

interface Question {
  id: number;
  question: string;
  videoUrl: string;
  compressedVideoUrl: string;
  scoutId?: string;
  language?: string;
  isCustom?: boolean;
  isSample?: boolean;
}

export default function InvestorQuestionsPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[2];
  const pitchId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsLocked();
  const isDemoPitch = pitchId === "HJqVubjnQ3RVGzlyDUCY4";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [language, setLanguage] = useState("Marathi");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [compressedVideoUrl, setCompressedVideoUrl] = useState<string | null>(null);

  // Sample languages and questions for the dialog
  const languages = [
    "Hindi",
    "Kannada",
    "Bengali",
    "Pahadi",
    "Nepali",
    "Assamese",
    "Marathi",
    "Gujarati",
    "English",
    "Sindhi",
    "Punjabi",
    "Urdu",
    "Odia",
  ];
  const sampleQuestions = [
    {
      id: 1,
      question: "Introduce yourself and the problem you are solving",
      videoUrl: "/videos/problem.mp4",
      compressedVideoUrl: "/videos/problem.mp4",
    },
    {
      id: 2,
      question: "What are you building",
      videoUrl: "/videos/market.mp4",
      compressedVideoUrl: "/videos/market.mp4",
    },
    {
      id: 3,
      question: "Why do you really want to solve the problem",
      videoUrl: "/videos/solution.mp4",
      compressedVideoUrl: "/videos/solution.mp4",
    },
    {
      id: 4,
      question:
        "Who are your customers, and how are they dealing with this problem today",
      videoUrl: "/videos/customer.mp4",
      compressedVideoUrl: "/videos/customer.mp4",
    },
    {
      id: 5,
      question:
        "Why will your customers switch from competitors to your product",
      videoUrl: "/videos/business.mp4",
      compressedVideoUrl: "/videos/business.mp4",
    },
    {
      id: 6,
      question: "How will you make money",
      videoUrl: "/videos/team.mp4",
      compressedVideoUrl: "/videos/team.mp4",
    },
    {
      id: 7,
      question:
        "What is the growth here (development, traction, or revenue), and challenges you are facing",
      videoUrl: "/videos/vision.mp4",
      compressedVideoUrl: "/videos/vision.mp4",
    },
  ];

  useEffect(() => {
    if (isLocked) {
      toast({
        title: isDemoPitch ? "Demo Pitch" : "Pitch is Locked",
        description: isDemoPitch ? "This is a demo pitch, no data can be changed" : "This pitch is currently locked and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast, isDemoPitch]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/questions?scoutId=${scoutId}&pitchId=${pitchId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();

      const fetchedQuestions: Question[] = data.map((q: any) => ({
        id: q.id,
        question: q.scoutQuestion,
        videoUrl: q.answerUrl || "",
        compressedVideoUrl: q.compressedAnswerUrl || "",
        scoutId: q.scoutId,
        language: q.answerLanguage || "Marathi",
        isCustom: q.isCustom,
        isSample: !q.answerUrl,
      }));

      setQuestions(fetchedQuestions);
      const firstQuestion = fetchedQuestions[0] || null;
      setSelectedQuestion(firstQuestion);
      setPreviewUrl(firstQuestion?.videoUrl || "");
      setCompressedVideoUrl(firstQuestion?.compressedVideoUrl || null);
      if (firstQuestion?.language) {
        setLanguage(firstQuestion.language);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load investor questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    questionId: number
  ) => {
    if (isLocked || isDemoPitch) {
      toast({
        title: isDemoPitch ? "Demo Pitch" : "Pitch is Locked",
        description: isDemoPitch ? "This is a demo pitch, no data can be changed" : "Cannot modify videos while the pitch is locked.",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB limit)
      const maxSize = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: "File is too large. Maximum file size is 20MB.",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadVideo = async (
    e: React.MouseEvent<HTMLButtonElement>,
    questionId: number
  ) => {
    if (isLocked || isDemoPitch) {
      toast({
        title: isDemoPitch ? "Demo Pitch" : "Pitch is Locked",
        description: isDemoPitch ? "This is a demo pitch, no data can be changed" : "Cannot upload videos while the pitch is locked.",
        variant: "destructive",
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file || !selectedQuestion) {
      toast({
        title: "Error",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Starting upload...");

    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const totalChunks = 4;
    const chunkSize = Math.ceil(file.size / totalChunks);
    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('filename', file.name);
        formData.append('scoutId', scoutId);
        formData.append('pitchId', pitchId);
        formData.append('pitchType', 'founder');

        const res = await fetch('http://localhost:9898/upload-chunk', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Chunk ${i + 1} upload failed`);
        setUploadProgress(((i + 1) / totalChunks) * 100);
        setUploadStatus(`Uploaded chunk ${i + 1} of ${totalChunks}`);
      }
      setUploadStatus("All chunks uploaded. Video is being processed...");

      // Poll for compression completion and refetch preview/compressed URL
      let pollCount = 0;
      let newCompressedUrl = null;
      while (pollCount < 30) { // up to 1 minute
        await new Promise((r) => setTimeout(r, 2000));
        await fetchQuestions(); // refresh questions
        const updated = questions.find(q => q.id === questionId);
        if (updated && updated.compressedVideoUrl) {
          newCompressedUrl = updated.compressedVideoUrl;
          break;
        }
        pollCount++;
      }
      if (newCompressedUrl) {
        setCompressedVideoUrl(newCompressedUrl);
        setUploadStatus("Compression complete!");
      } else {
        setUploadStatus("Compression in progress. Please refresh later.");
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearVideo = () => {
    if (isLocked || isDemoPitch) {
      toast({
        title: isDemoPitch ? "Demo Pitch" : "Pitch is Locked",
        description: isDemoPitch ? "This is a demo pitch, no data can be changed" : "Cannot remove videos while the pitch is locked.",
        variant: "destructive",
      });
      return;
    }
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setPreviewUrl(question.videoUrl);
    setCompressedVideoUrl(question.compressedVideoUrl);
    if (question.language) {
      setLanguage(question.language);
    }
  };

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card className="w-full border-none mt-10 px-4 bg-[#0e0e0e] container mx-auto">
      <CardContent className="border-none">
        {(isLocked || isDemoPitch) && (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-medium">
              {isDemoPitch ? "This is a demo pitch, no data can be changed" : "This pitch is locked and cannot be modified"}
            </p>
          </div>
        )}
        <div className="flex justify-end mb-4">
          <Dialog open={questionsOpen} onOpenChange={setQuestionsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#2a2a2a] hover:bg-gray-600 rounded-[0.35rem] border-gray-600 text-white"
                disabled={isLocked}
              >
                Sample Pitch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90%] bg-[#1a1a1a] border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Sample Screening Questions</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-12 gap-6 mt-10">
                {/* Language Column */}
                {/* <div className="col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold">Languages</h3>
                  <div className="space-y-2">
                    {languages.map((language) => (
                      <div
                        key={language}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedLanguage === language
                          ? "text-blue-600"
                          : "hover:bg-muted"
                          }`}
                        onClick={() => setSelectedLanguage(language)}
                      >
                        <span className="text-sm">{language}</span>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Video Preview Column */}
                <div className="col-span-6">
                  <Card className="overflow-hidden border-0 bg-[#1a1a1a] shadow-none">
                    <div className="aspect-[9/16] h-[533px] w-[300px] flex items-center justify-center">
                      {compressedVideoUrl && compressedVideoUrl.endsWith('.m3u8') ? (
                        <ReactPlayer url={compressedVideoUrl} controls width="100%" height="100%" config={{ file: { forceHLS: true } }} />
                      ) : previewUrl && previewUrl.endsWith('.m3u8') ? (
                        <ReactPlayer url={previewUrl} controls width="100%" height="100%" config={{ file: { forceHLS: true } }} />
                      ) : (
                        <VideoStreamer src={compressedVideoUrl || previewUrl || "/dummyVideo.mp4"} />
                      )}
                    </div>
                  </Card>
                </div>
                {/* Questions Column */}
                <div className="col-span-4 space-y-4">
                  <h3 className="text-lg font-semibold">
                    Investor's Questions
                  </h3>
                  <div className="space-y-2">
                    {sampleQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors hover:text-blue-600"
                        onClick={() => handleQuestionSelect(q)}
                      >
                        <p className="text-sm">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-muted-foreground">No questions available</p>
        ) : (
          <div className="flex justify-between gap-10">
            <div className="w-1/2">
              <div className="space-y-4">
                <div className="border-2 flex flex-col border-dashed border-gray-700 rounded-lg p-6 text-center">
                  {previewUrl ? (
                    <div className="space-y-4 flex flex-col items-center justify-center">
                      {compressedVideoUrl && compressedVideoUrl.endsWith('.m3u8') ? (
                        <ReactPlayer url={compressedVideoUrl} controls width="100%" height="auto" config={{ file: { forceHLS: true } }} />
                      ) : previewUrl && previewUrl.endsWith('.m3u8') ? (
                        <ReactPlayer url={previewUrl} controls width="100%" height="auto" config={{ file: { forceHLS: true } }} />
                      ) : (
                        <VideoStreamer src={compressedVideoUrl || previewUrl || "/dummyVideo.mp4"} />
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearVideo}
                          className={`w-full ${isLocked ? 'opacity-100' : ''}`}
                          disabled={isLocked}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Video
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) =>
                            selectedQuestion &&
                            handleUploadVideo(e, selectedQuestion.id)
                          }
                          disabled={isUploading || isLocked}
                          className={`w-full ${isLocked ? 'opacity-100' : ''}`}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
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
                      onClick={() => !isLocked && fileInputRef.current?.click()}
                      className={`cursor-pointer space-y-4 ${isLocked ? 'opacity-100' : ''}`}
                    >
                      <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Video className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Upload your answer
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          MP4, MOV, WebM or Ogg
                          The max file size is 20MB. Please compress your video before uploading.
                          You can Compress your video <Link href={"https://www.freeconvert.com/video-compressor"} target="_blank" className="text-blue-500">here</Link>
                          or use any other video compressor.
                          <br />
                          (Please note that we are not affiliated with freeconvert.com and we are not responsible for any issues that may occur while using their service or any other video compressor.)
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) =>
                      selectedQuestion &&
                      handleFileChange(e, selectedQuestion.id)
                    }
                    disabled={isLocked}
                  />
                  <div className="mt-5">
                    <Combobox
                      placeholder="Select video's language"
                      value={'Marathi'}
                      options={languages}
                      onSelect={(value) => setLanguage(value)}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investor's Questions</h3>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-2">
                    {questions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleQuestionSelect(item)}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedQuestion?.id === item.id
                          ? "text-blue-600"
                          : "hover:bg-muted"
                          }`}
                      >
                        <span className="text-sm">{item.question}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
