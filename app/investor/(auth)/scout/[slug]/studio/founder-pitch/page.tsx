"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

interface Question {
  id?: number;
  question: string;
  videoUrl?: string;
  previewImage?: string;
  isCustom?: boolean;
}

const questionsData = {
  defaultQuestions: [
    {
      id: 1,
      question: "Introduce yourself",
      videoUrl: "/videos/problem.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 2,
      question: "How did you come up with the idea",
      videoUrl: "/videos/market.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 3,
      question:
        "What is the problem are you solving, and why is it really important for you to solve it",
      videoUrl: "videos/solution.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 4,
      question: "Who are your customers, and why would they pay for it",
      videoUrl: "/videos/customer.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 5,
      question:
        "How much have you worked on your startup, and where do you see it in 3 years",
      videoUrl: "/videos/business.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 6,
      question: "What challenges are you facing, and what support do you need",
      videoUrl: "/videos/team.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
    {
      id: 7,
      question: "Why should investors believe in your vision?",
      videoUrl: "/videos/vision.mp4",
      previewImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    },
  ],
};

export default function InvestorStudioPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<
    "sample" | "custom" | null
  >(null);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(
    questionsData.defaultQuestions[0]
  );
  const [questionsOpen, setQuestionsOpen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/endpoints/scouts/questions?scoutId=${scoutId}`
        );
        if (res.status === 200) {
          const data = await res.json();
          if (data.length) {
            const isCustom = data.some((q: Question) => q.isCustom);
            if (isCustom) {
              setSelectedOption("custom");
              setCustomQuestions(
                data.map((q: any) => ({
                  id: q.id,
                  question: q.scoutQuestion,
                  videoUrl: q.scoutAnswerSampleUrl ?? undefined,
                  isCustom: true,
                }))
              );
            } else {
              setSelectedOption("sample");
            }
          }
        } else {
          console.error("Failed to fetch questions", res.status);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [scoutId]);
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    if (selectedOption === "custom") {
      let count = 0;
      customQuestions.forEach((q) => {
        if (q.question === "") {
          count++;
        }
      });
      if (count === 0) {
        console.log("All questions filled", count);
        setDisabled(false);
      }
    }
  }, [customQuestions]);

  const handleOptionChange = (option: "sample" | "custom") => {
    if (selectedOption === option) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
      if (option === "custom" && customQuestions.length === 0) {
        setCustomQuestions(
          Array(7)
            .fill(null)
            .map((_, i) => ({
              id: i + 1,
              question: "",
            }))
        );
      }
    }
  };

  const handleSaveQuestions = async () => {
    if (
      selectedOption === "custom" &&
      customQuestions.every((q) => q.question.trim() === "")
    ) {
      toast({
        title: "No questions entered",
        description: "Please enter at least one custom question",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<Question>[] =
      selectedOption === "sample"
        ? questionsData.defaultQuestions.map(
            ({ id, question, videoUrl, previewImage }) => ({
              id,
              question,
              videoUrl,
              previewImage,
              isCustom: false,
            })
          )
        : customQuestions.map((q) => ({
            question: q.question,
            ...(q.isCustom === false ? { isCustom: false } : {}), // omit if true
          }));

    try {
      const res = await fetch("/api/endpoints/scouts/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId, questions: payload }),
      });

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Questions saved",
          description: "Your screening questions have been updated",
        });
      } else {
        toast({
          title: "Error saving questions",
          description: `Status code: ${res.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  return (
    <div className="min-h-screen px-8 text-white">
      <div className="container mx-auto py-8">
        <Card className="bg-[#1a1a1a] border-gray-700 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sample"
                    className="border-gray-500"
                    checked={selectedOption === "sample"}
                    onCheckedChange={() => handleOptionChange("sample")}
                  />
                  <label htmlFor="sample" className="text-sm font-medium">
                    Use Sample Questions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom"
                    className="border-gray-500"
                    checked={selectedOption === "custom"}
                    onCheckedChange={() => handleOptionChange("custom")}
                  />
                  <label htmlFor="custom" className="text-sm font-medium">
                    Add Custom Questions
                  </label>
                </div>
              </div>
              <Dialog open={questionsOpen} onOpenChange={setQuestionsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#2a2a2a] hover:bg-gray-600 border-gray-600 text-white"
                  >
                    See Sample Questions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-[#1a1a1a] border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Sample Screening Questions</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="space-y-4">
                      <div className="aspect-video bg-[#0e0e0e] rounded-lg overflow-hidden">
                        {selectedQuestion.videoUrl ? (
                          <video
                            src={selectedQuestion.videoUrl}
                            poster={selectedQuestion.previewImage}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            Select a question to view sample response
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">Sample Response</p>
                    </div>
                    <div className="space-y-2">
                      <ScrollArea className="h-[300px] pr-4">
                        {questionsData.defaultQuestions.map((question) => (
                          <div
                            key={question.id}
                            className={`p-3 rounded-md cursor-pointer hover:bg-gray-700 transition-colors ${
                              selectedQuestion.id === question.id
                                ? "bg-gray-700"
                                : ""
                            }`}
                            onClick={() => setSelectedQuestion(question)}
                          >
                            <p className="text-sm font-medium">
                              {question.question}
                            </p>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {selectedOption && (
              <div className="border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedOption === "sample"
                      ? "Sample Questions"
                      : "Custom Questions"}
                  </h3>
                  <Button
                    onClick={handleSaveQuestions}
                    disabled={disabled}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Questions
                  </Button>
                </div>
                <div className="space-y-4">
                  {selectedOption === "sample"
                    ? questionsData.defaultQuestions.map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm font-medium text-gray-400 w-6">
                            {index + 1}.
                          </span>
                          <p className="text-sm flex-1">{question.question}</p>
                        </div>
                      ))
                    : customQuestions.map((question, index) => (
                        <div
                          key={question.id ?? index}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm font-medium text-gray-400 w-6">
                            {index + 1}.
                          </span>
                          <Input
                            value={question.question}
                            onChange={(e) => {
                              const updatedQuestions = [...customQuestions];
                              updatedQuestions[index].question = e.target.value;
                              setCustomQuestions(updatedQuestions);
                            }}
                            placeholder={`Enter question ${index + 1}...`}
                            className="flex-1 bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
