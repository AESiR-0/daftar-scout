"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadInvestorsPitchVideo } from "@/lib/actions/video";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { usePitch } from "@/contexts/PitchContext"; // Assuming scoutId is part of PitchContext

interface Question {
  id: number;
  question: string;
  videoUrl: string;
  scoutId?: string;
  language?: string;
  isCustom?: boolean;
  isSample?: boolean;
}

export default function InvestorQuestionsPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [language, setLanguage] = useState("English");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const path = usePathname();
  const mode = path.includes("edit") ? "edit" : "create";
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/questions?scoutId=${scoutId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();

      // Map API data to Question interface
      const fetchedQuestions: Question[] = data.map((q: any) => ({
        id: q.id,
        question: q.scoutQuestion,
        videoUrl: q.scoutAnswerSampleUrl || "",
        scoutId: q.scoutId,
        language: q.language || "English",
        isCustom: q.isCustom,
        isSample: q.isSample,
      }));

      setQuestions(fetchedQuestions);
      setSelectedQuestion(fetchedQuestions[0] || null);
      setPreviewUrl(fetchedQuestions[0]?.videoUrl || "");
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
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadVideo = async (
    e: React.MouseEvent<HTMLButtonElement>,
    questionId: number
  ) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await uploadInvestorsPitchVideo(file, scoutId);
      setPreviewUrl(url);
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video has been uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error uploading video",
        description: "There was an error uploading your video",
        variant: "destructive",
      });
    }
  };

  const clearVideo = () => {
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setPreviewUrl(question.videoUrl);
    setLanguage(question.language || "English");
  };

  return (
    <Card className="w-full border-none mt-10 px-4 bg-[#0e0e0e] container mx-auto">
      <CardContent className="border-none">
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
                    <div className="space-y-4">
                      <video
                        src={previewUrl}
                        controls
                        className="w-full rounded-[0.35rem] aspect-video"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearVideo}
                          className="w-full"
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
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer space-y-4"
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
                          MP4, WebM or Ogg (max. 20MB)
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
                  />
                  <div className="mt-5">
                    <Combobox
                      placeholder="Select video's language"
                      value={language}
                      options={[
                        "English",
                        "Spanish",
                        "French",
                        "German",
                        "Italian",
                        "Portuguese",
                      ]}
                      onSelect={(value) => setLanguage(value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2 mt-4 pr-4">
                  {questions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleQuestionSelect(item)}
                      className={`px-1 rounded-[0.35rem] py-1 cursor-pointer hover:underline transition-colors ${
                        selectedQuestion?.id === item.id ? "bg-muted/50" : ""
                      }`}
                    >
                      <h3 className="text-sm font-medium">{item.question}</h3>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
