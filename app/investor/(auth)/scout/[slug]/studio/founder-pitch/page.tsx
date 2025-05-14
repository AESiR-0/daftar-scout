"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
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
      question: "Introduce yourself and the problem you are solving",
    },
    {
      id: 2,
      question: "What are you building",
    },
    {
      id: 3,
      question: "Why do you really want to solve the problem",
    },
    {
      id: 4,
      question: "Who are your customers, and how are they dealing with this problem today",
    },
    {
      id: 5,
      question: "Why will your customers switch from competitors to your product",
    },
    {
      id: 6,
      question: "How will you make money",
    },
    {
      id: 7,
      question: "What is the growth here (development, traction, or revenue), and challenges you are facing",
    },
  ],
};

export default function InvestorStudioPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { toast } = useToast();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"sample" | "custom">("sample");
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(
    questionsData.defaultQuestions[0]
  );
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [isLoading, setIsLoading] = useState(false);

  const getVideoSource = (language: string, questionId?: number) => {
    if (language === "Assamese" && questionId === 1) {
      return "/videos/Q1_Assamese - BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === 2) {
      return "/videos/Q2_Assamese - BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === 3) {
      return "/videos/Q3_Assamese - BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === 4) {
      return "/videos/Q4_Assamese - BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === 5) {
      return "/videos/Q5_Assamese - BristyBorah.MOV"
    }
    if (language === "Assamese" && questionId === 6) {
      return "/videos/Q6_Assamese - BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === 7) {
      return "/videos/Q7_Assamese - BristyBorah.mov"
    }
    if (language === "Hindi" && questionId === 1) {
      return "/videos/Q1_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 2) {
      return "/videos/Q2_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 3) {
      return "/videos/Q3_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 4) {
      return "/videos/Q4_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 5) {
      return "/videos/Q5_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 6) {
      return "/videos/Q6_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === 7) {
      return "/videos/Q7_Hindi-VanditaVerma.mov"
    }
    if (language === "Punjabi" && questionId === 1) {
      return "/videos/Q1_punjabi - Manav Maini.mov"
    }
    if (language === "Punjabi" && questionId === 2) {
      return "/videos/Q2_punjabi - Manav Maini.mov"
    }
    if (language === "Punjabi" && questionId === 3) {
      return "/videos/Q3_punjabi - Manav Maini.mov"
    }
    if (language === "Punjabi" && questionId === 4) {
      return "/videos/Q4_punjabi - Manav Maini.mov"
    }
    if (language === "Punjabi" && questionId === 5) {
      return "/videos/Q5_punjabi - Manav Maini.mp4"
    }
    if (language === "Punjabi" && questionId === 6) {
      return "/videos/Q6_punjabi - Manav Maini.mov"
    }
    if (language === "Punjabi" && questionId === 7) {
      return "/videos/Q7_punjabi - Manav Maini.mov"
    }
    if (language === "Sindhi" && questionId === 1) {
      return "/videos/Q1_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 2) {
      return "/videos/Q2_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 3) {
      return "/videos/Q3_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 4) {
      return "/videos/Q4_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 5) {
      return "/videos/Q5_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 6) {
      return "/videos/Q6_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === 7) {
      return "/videos/Q7_Sindhi.mov"
    }
    if (language === "Gujarati" && questionId === 1) {
      return "/videos/Q1_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 2) {
      return "/videos/Q2_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 3) {
      return "/videos/Q3_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 4) {
      return "/videos/Q4_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 5) {
      return "/videos/Q5_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 6) {
      return "/videos/Q6_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === 7) {
      return "/videos/Q7_Gujarati.mp4"
    }
    if(language === "Savji" && questionId === 1){
      return "/videos/Q1_Savji.mp4"
    }
    if(language === "Savji" && questionId === 2){
      return "/videos/Q2_Savji.mp4"
    }
    if(language === "Savji" && questionId === 3){
      return "/videos/Q3_Savji.mp4"
    }
    if(language === "Savji" && questionId === 4){
      return "/videos/Q4_Savji.mp4"
    }
    if(language === "Savji" && questionId === 5){
      return "/videos/Q5_Savji.mp4"
    }
    if(language === "Savji" && questionId === 6){
      return "/videos/Q6_Savji.mp4"
    }
    if(language === "Savji" && questionId === 7){
      return "/videos/Q7_Savji.mp4"
    }

    return "/videos/sample-pitch.mp4" // Default video
  }

  // Sample languages and questions for the new dialog section
  const languages = [
    "Hindi",
    "Savji",
    "Sindhi",
    "Punjabi",
    "Assamese",
    "Gujarati",
    "English",
    "Bengali",
    "Pahadi",
    "Nepali",
    "Urdu",
    "Odia",
  ]
  const questions = questionsData.defaultQuestions.map((q) => ({
    id: q.id,
    title: q.question,
  }));

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

  const handleOptionChange = (option: "sample" | "custom") => {
    if (selectedOption === option) {
      setSelectedOption("sample"); // Default to sample if unchecking current option
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

  const handleSaveQuestions = async (showToast = true) => {
    if (!customQuestions || customQuestions.length === 0) {
      if (showToast) {
        toast({
          title: "Error",
          description: "Please add at least one custom question",
          variant: "error",
        });
      }
      return;
    }

    try {
      setIsLoading(true);

      // Get existing questions to ensure we have the correct data
      const getResponse = await fetch(`/api/endpoints/scouts/questions?scoutId=${scoutId}&language=${selectedLanguage}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch existing questions');
      }

      const existingQuestions = await getResponse.json();
      
      // Update questions using PATCH
      const response = await fetch(`/api/endpoints/scouts/questions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoutId,
          language: selectedLanguage,
          questions: customQuestions.map(q => ({
            scoutQuestion: q.question,
            isCustom: true,
            scoutAnswerSampleUrl: q.videoUrl || null
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update questions');
      }

      if (showToast) {
        toast({
          title: "Success",
          description: "Questions updated successfully",
          variant: "success",
        });
      }
      router.refresh();
    } catch (error: any) {
      console.error('Error updating questions:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: error.message || 'Failed to update questions',
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the auto-save to prevent too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedOption && (customQuestions.length > 0 || selectedOption === "sample")) {
        handleSaveQuestions(false); // Pass false to prevent toast during auto-save
      }
    }, 1000); // Wait 1 second after changes before saving

    return () => clearTimeout(timeoutId);
  }, [selectedOption, customQuestions, selectedLanguage]);

  return (
    <div className="min-h-screen px-8 text-white">
      <div className="container mx-auto py-8">
        <Card className="bg-[#1a1a1a] border-gray-700 shadow-lg rounded-[0.35rem]">
          <CardContent className="p-6 space-y-6 ">
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
                    className="bg-[#2a2a2a] hover:bg-gray-600 rounded-[0.35rem] border-gray-600 text-white"
                  >
                    Sample Pitch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90%] bg-[#1a1a1a] border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Sample Screening Questions</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-10 gap-6 mt-10">
                    {/* Language Column */}
                    <div className="col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold">Languages</h3>
                      <div className="space-y-2">
                        {languages.map((language) => (
                          <div
                            key={language}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedLanguage === language ? 'text-blue-600' : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedLanguage(language)}
                          >
                            <span className="text-sm">{language}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video Preview Column */}
                    <div className="col-span-4">
                      <Card className="overflow-hidden border-0 w-[300px] h-[533px] bg-muted/50">
                        <div className="aspect-[9/16]  flex items-center justify-center">
                          <ReactPlayer
                            url={getVideoSource(selectedLanguage, selectedQuestion.id)}
                            width="100%"
                            height="100%"
                            controls
                            playing={false}
                            style={{ aspectRatio: '9/16' }}
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Questions Column */}
                    <div className="col-span-4 space-y-4">
                      <h3 className="text-lg font-semibold">Investor's Questions</h3>
                      <div className="space-y-2">
                        {questions.map((q) => (
                          <div
                            key={q.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedQuestion.id === q.id ? 'text-blue-600' : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedQuestion(questionsData.defaultQuestions.find(q2 => q2.id === q.id)!)}
                          >
                            <span className="text-sm">{q.title}</span>
                          </div>
                        ))}
                      </div>
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