"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import Link from "next/link";
import VideoStreamer from "@/components/VideoStreamer";

const reportReasons = [
  { id: "false-claims", label: "False Claims" },
  { id: "scam", label: "Scam" },
  { id: "fraud", label: "Fraud" },
  { id: "plagiarism", label: "Plagiarism" },
  { id: "violence", label: "Violence" },
  { id: "threats", label: "Threats" },
  { id: "offensive-content", label: "Offensive Content" },
  { id: "illegal-activities", label: "Illegal Activities" },
  { id: "cyberbully", label: "Cyberbully" },
  { id: "nudity", label: "Nudity" },
  { id: "abusive-language", label: "Abusive Language" },
  { id: "deep-fake", label: "Deep Fake" },
  { id: "misleading-data", label: "Misleading Data" },
];

interface FoundersPitch {
  status: string;
  location: string;
  sectors: string[];
  demoLink?: string;
  stage: string;
  ask: string;
  questions: {
    id: number;
    question: string;
    videoUrl: string;
  }[];
}

interface FoundersPitchSectionProps {
  pitch: FoundersPitch;
  onScheduleMeeting: () => void;
}

const getVideoSource = (language: string, questionId: string) => {
  // Map numerical IDs to question types
  const questionTypeMap: { [key: string]: string } = {
    "1": "problem",
    "2": "market",
    "3": "solution",
    "4": "customer",
    "5": "business",
    "6": "help",
    "7": "challenges"
  };

  const questionType = questionTypeMap[questionId] || "problem";

  if (language === "Assamese" && questionType === "problem") {
    return "/videos/Q1_Assamese - BristyBorah.MOV"
  }
  if (language === "Assamese" && questionType === "solution") {
    return "/videos/Q2_Assamese - BristyBorah.MOV"
  }
  if (language === "Assamese" && questionType === "market") {
    return "/videos/Q3_Assamese - BristyBorah.mov"
  }
  if (language === "Assamese" && questionType === "business") {
    return "/videos/Q4_Assamese - BristyBorah.mov"
  }
  if (language === "Assamese" && questionType === "future") {
    return "/videos/Q5_Assamese - BristyBorah.MOV"
  }
  if (language === "Assamese" && questionType === "help") {
    return "/videos/Q6_Assamese - BristyBorah.mov"
  }
  if (language === "Assamese" && questionType === "challenges") {
    return "/videos/Q7_Assamese - BristyBorah.mov"
  }
  if (language === "Hindi" && questionType === "problem") {
    return "/videos/Q1_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "solution") {
    return "/videos/Q2_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "market") {
    return "/videos/Q3_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "business") {
    return "/videos/Q4_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "future") {
    return "/videos/Q5_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "help") {
    return "/videos/Q6_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionType === "challenges") {
    return "/videos/Q7_Hindi-VanditaVerma.mov"
  }
  if (language === "Punjabi" && questionType === "problem") {
    return "/videos/Q1_punjabi - Manav Maini.mov"
  }
  if (language === "Punjabi" && questionType === "solution") {
    return "/videos/Q2_punjabi - Manav Maini.mov"
  }
  if (language === "Punjabi" && questionType === "market") {
    return "/videos/Q3_punjabi - Manav Maini.mov"
  }
  if (language === "Punjabi" && questionType === "business") {
    return "/videos/Q4_punjabi - Manav Maini.mov"
  }
  if (language === "Punjabi" && questionType === "future") {
    return "/videos/Q5_punjabi - Manav Maini.mp4"
  }
  if (language === "Punjabi" && questionType === "help") {
    return "/videos/Q6_punjabi - Manav Maini.mov"
  }
  if (language === "Punjabi" && questionType === "challenges") {
    return "/videos/Q7_punjabi - Manav Maini.mov"
  }
  if (language === "Sindhi" && questionType === "problem") {
    return "/videos/Q1_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "solution") {
    return "/videos/Q2_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "market") {
    return "/videos/Q3_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "business") {
    return "/videos/Q4_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "future") {
    return "/videos/Q5_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "help") {
    return "/videos/Q6_Sindhi.mov"
  }
  if (language === "Sindhi" && questionType === "challenges") {
    return "/videos/Q7_Sindhi.mov"
  }
  if (language === "Gujarati" && questionType === "problem") {
    return "/videos/Q1_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "solution") {
    return "/videos/Q2_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "market") {
    return "/videos/Q3_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "business") {
    return "/videos/Q4_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "future") {
    return "/videos/Q5_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "help") {
    return "/videos/Q6_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionType === "challenges") {
    return "/videos/Q7_Gujarati.mp4"
  }
  if (language === "Odia" && questionType === "problem") {
    return "/videos/Q1_Odia.mp4"
  }
  return "/videos/sample-pitch.mp4" // Default video
}

export function FoundersPitchSection({
  pitch,
  onScheduleMeeting,
}: FoundersPitchSectionProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(pitch.questions[0] || null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Hindi");
  const { toast } = useToast();

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleReport = async () => {
    if (selectedReasons.length === 0) return;
    setIsSubmitting(true);

    try {
      // Add your API call here
      await fetch("/api/report-founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasons: selectedReasons,
        }),
      });

      setShowReportDialog(false);
      setSelectedReasons([]);
      toast({
        title: "Report Submitted",
        description: "Thank you for helping us maintain a better ecosystem.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVideo = selectedQuestion ? getVideoSource(selectedLanguage, selectedQuestion.id.toString()) : null;

  // Helper function to format sectors
  const formatSectors = (sectors: string[]) => {
    if (sectors.length === 0) return "";
    if (sectors.length === 1) return sectors[0];
    if (sectors.length === 2) return `${sectors[0]} and ${sectors[1]}`;

    return (
      sectors.slice(0, -2).join(", ") +
      ", " +
      sectors.slice(-2, -1) +
      " and " +
      sectors.slice(-1)
    );
  };

  return (
    <Card className="w-full border-none mt-10 p-0 bg-[#0e0e0e]">
      <CardContent className="border-none">
        <div className="flex flex-col justify-center">
          <div className="flex h-fit gap-10">
            <div className="w-1/2">
              {selectedQuestion ? (
                <div className="space-y-4 rounded-[0.35rem] ml-20 w-[300px] h-[533px]">
                  <VideoStreamer src={selectedQuestion.compressedVideoUrl || selectedQuestion.videoUrl || "/dummyVideo.mp4"} />
                </div>
              ) : (
                <div className="w-[300px] h-[533px] aspect-[9/16] bg-muted rounded-[0.35rem] ml-20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No video available
                  </p>

                </div>
              )}
              <div className="flex pl-20 my-5 text-center  items-center gap-2">
                <p className="text-sm text-muted-foreground">Language : </p>
                <span className="text-sm">Marathi</span>
              </div>
              {/* <div className="mt-2 ml-20">
                <div className="flex items-center gap-2">
                  <Label htmlFor="language" className="text-sm text-muted-foreground">Language:</Label>
                  <select
                    id="language"
                    value={selectedLanguage}
                    disabled
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 rounded-[0.35rem] text-sm px-2 py-1"
                  >
                    {["English", "Hindi", "Punjabi", "Sindhi", "Gujarati", "Odia", "Assamese"].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
            </div>
            <div className="w-1/2">
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="space-y-4 pr-4">
                  {pitch.questions.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2 rounded-[0.35rem] hover:bg-muted/50 cursor-pointer transition-colors",
                        item.id === selectedQuestion?.id && "text-blue-600"
                      )}
                      onClick={() => setSelectedQuestion(item)}
                    >
                      <h3 className="text-sm font-medium">{item.question}</h3>
                    </div>
                  ))}
                </div>

              </ScrollArea>

            </div>
          </div>

          <div className="px-4">
            <hr />
          </div>

          <div className="mt-8">
            {/* Founder's Ask */}


            <div className="flex flex-col">

              <h3 className="text-md pl-4 text-foreground">Founder's Ask</h3>
              <div className="rounded-[0.35rem] p-4">
                <p className="text-sm text-muted-foreground">{pitch.ask == ""
                  ? "No Ask"
                  : pitch.ask}</p>
              </div>
            </div>

            {/* Founder Details Grid */}
            <div className="w-1/2 px-5">
              <h3 className="text-md mb-2 text-foreground">Details</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Stage</p>
                <span className="text-sm">{pitch.stage}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Pitching From</p>
                <span className="text-sm">{pitch.location}</span>
              </div>

              <div className="flex gap-2">

                <p className="text-sm text-muted-foreground">Demo Link</p>
                {pitch.demoLink ? (
                  <Link
                    href={`https://${pitch.demoLink}`}
                    className="text-sm hover:underline"
                    target="_blank"
                  >
                    {pitch.demoLink}
                  </Link>
                ) : (
                  <span className="text-sm">No Demo Link</span>
                )}
              </div>
              <div className="flex gap-2">
                <p className="text-sm text-muted-foreground">Sectors</p>
                <span className="text-sm">{formatSectors(pitch.sectors)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report</DialogTitle>
            <DialogDescription>
              Red flag this startup and help Daftar build a better startup
              ecosystem.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[50vh] w-full">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {reportReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-md transition-colors",
                      selectedReasons.includes(reason.id)
                        ? "bg-blue-500/10"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={reason.id}
                      checked={selectedReasons.includes(reason.id)}
                      onCheckedChange={() => handleReasonToggle(reason.id)}
                      className={cn(
                        "border-2",
                        selectedReasons.includes(reason.id)
                          ? "border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                          : "border-muted-foreground"
                      )}
                    />
                    <Label
                      htmlFor={reason.id}
                      className={cn(
                        "cursor-pointer flex-1",
                        selectedReasons.includes(reason.id) && "text-blue-500"
                      )}
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleReport}
              disabled={selectedReasons.length === 0 || isSubmitting}
              className={cn(
                "w-full",
                isSubmitting
                  ? "bg-blue-500/50"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
