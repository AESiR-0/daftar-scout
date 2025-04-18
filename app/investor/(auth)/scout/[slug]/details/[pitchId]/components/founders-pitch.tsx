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
  founderQuestions?: {
    question: string;
    answer: string;
  }[];
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

const questions = [
  {
    id: 1,
    question: "Introduce yourself.",
    answer: "",
  },
  {
    id: 2,
    question: "How did you come up with the idea?",
    answer: "",
  },
  {
    id: 3,
    question:
      "What is the problem, and why is it so important for you to solve it?",
    answer: "",
  },
  {
    id: 4,
    question: "Who are your customers, and why would they pay for it?",
    answer: "",
  },
  {
    id: 5,
    question:
      "What is the progress so far, and where do you see it in 3 years?",
    answer: "",
  },
  {
    id: 6,
    question: "What are the challenges today and what support do you want?",
    answer: "",
  },
];

export function FoundersPitchSection({
  pitch,
  onScheduleMeeting,
}: FoundersPitchSectionProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const selectedVideo = pitch.questions.find(
    (q) => q.id === selectedQuestion.id
  )?.videoUrl;

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
              {selectedVideo ? (
                <div className="space-y-4">
                  <video
                    src={selectedVideo}
                    controls
                    className="w-full rounded-[0.35rem] aspect-video bg-muted"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-muted rounded-[0.35rem] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No video available
                  </p>
                </div>
              )}
              <div className="mt-2 ml-4">
                <p className="text-sm text-muted-foreground">
                  Language: English
                </p>
              </div>
            </div>
            <div className="w-1/2">
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="space-y-4 pr-4">
                  {questions.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "px-4 rounded-[0.35rem] hover:underline cursor-pointer transition-colors"
                      )}
                    >
                      <h3 className="text-sm font-medium">{item.question}</h3>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="">
            {/* Founder's Ask */}
            <div className="flex flex-col">
              <h3 className="text-md pl-4  text-foreground">Founder's Ask</h3>
              <div className="  rounded-[0.35rem] p-4">
                <p className="text-sm text-muted-foreground">
                  We are seeking $500,000 in funding to accelerate our product
                  development and expand our marketing efforts. Additionally, we
                  are looking for strategic partnerships in the AI/ML sector to
                  enhance our technological capabilities and market reach. Any
                  introductions to potential partners or advisors with
                  experience in scaling SaaS businesses would be highly
                  appreciated.
                </p>
              </div>
            </div>

            {/* Founder Details Grid */}
            <div className="w-1/2 px-5">
              <h3 className="text-md mb-2 text-foreground">Details</h3>
              <div className=" flex  items-center gap-2">
                <p className="text-sm text-muted-foreground ">Stage</p>
                {pitch.stage}
              </div>
              <div className=" flex  items-center gap-2">
                <p className="text-sm text-muted-foreground">Pitching From</p>
                <p className="text-sm">{pitch.location}</p>
              </div>
              <div className="  flex gap-2 ">
                <p className="text-sm text-muted-foreground">Demo Link</p>
                {pitch.demoLink ? (
                  <Link
                    href={pitch.demoLink}
                    className="text-sm  hover:underline"
                  >
                    View Demo
                  </Link>
                ) : (
                  <span className="text-sm">No Demo Link</span>
                )}
              </div>
              <div className="flex gap-2 ">
                <p className="text-sm text-muted-foreground">Sectors</p>
                <p className="text-sm">{formatSectors(pitch.sectors)}</p>
              </div>
            </div>

            {/* Founder's Specific Questions */}
            {pitch.founderQuestions && pitch.founderQuestions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Founder's Responses
                </p>
                <div className="space-y-3">
                  {pitch.founderQuestions.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#1f1f1f] rounded-[0.35rem] space-y-2"
                    >
                      <p className="text-sm font-medium">{item.question}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
