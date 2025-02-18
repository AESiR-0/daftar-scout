"use client"

import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { questions } from "@/lib/dummy-data/questions";
import { usePathname } from "next/navigation";
import { Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadVideo } from "@/lib/actions/video";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";

// Add this type definition at the top of the file
type Question = {
    id: number;
    question: string;
    videoUrl: string;
};

// Update the dummy data to use the questions from founders-pitch.tsx
const questionsWithVideos: Question[] = [
    {
        id: 1,
        question: "Introduce yourself.",
        videoUrl: ""
    },
    {
        id: 2,
        question: "How did you come up with the idea?",
        videoUrl: ""
    },
    {
        id: 3,
        question: "What is the problem, and why is it so important for you to solve it?",
        videoUrl: ""
    },
    {
        id: 4,
        question: "Who are your customers, and why would they pay for it?",
        videoUrl: ""
    },
    {
        id: 5,
        question: "What is the progress so far, and where do you see it in 3 years?",
        videoUrl: ""
    },
    {
        id: 6,
        question: "What are the challenges today and what support do you want?",
        videoUrl: ""
    }
];

export default function InvestorQuestionsPage() {
    // Update the state to use the first question's data
    const [selectedQuestion, setSelectedQuestion] = useState<Question>(questionsWithVideos[0]);
    const [language, setLanguage] = useState("English");
    const [previewUrl, setPreviewUrl] = useState<string>(questionsWithVideos[0].videoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const path = usePathname();
    const mode = path.includes('edit') ? 'edit' : 'create';
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUploadVideo = async (e: React.MouseEvent<HTMLButtonElement>, questionId: number) => {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            try {
                const url = await uploadVideo(file, questionId);
                setPreviewUrl(url);
                toast({
                    title: "Video uploaded successfully",
                    description: "Your video has been uploaded successfully",
                    variant: "success",
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Error uploading video",
                    description: "There was an error uploading your video",
                    variant: "error",
                });
            }
        }

    };
    const clearVideo = () => {
        setPreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Add this function to handle question selection
    const handleQuestionSelect = (question: Question) => {
        setSelectedQuestion(question);
        setPreviewUrl(question.videoUrl);
    };

    return (
        <Card className="w-full border-none mt-10 px-4 bg-[#0e0e0e] container mx-auto">
            <CardContent className="border-none">
                <div className="flex justify-between gap-10">
                    <div className="w-1/2">
                        <div className="space-y-4">
                            <div className="border-2 flex flex-col border-dashed border-gray-700 rounded-lg p-6 text-center">
                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="w-full rounded-[0.35rem]  aspect-video"
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
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleUploadVideo(e, selectedQuestion.id)}
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
                                            <p className="text-sm font-medium">Upload your answer</p>
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
                                    onChange={(e) => handleFileChange(e, selectedQuestion.id)}
                                />
                                <div className="mt-5">
                                    <Combobox
                                        placeholder="Select video's language"
                                        value={language}
                                        options={
                                            [
                                                "English",
                                                "Spanish",
                                                "French",
                                                "German",
                                                "Italian",
                                                "Portuguese",
                                            ]
                                        }
                                        onSelect={(value) => setLanguage(value)}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="w-1/2">
                        <ScrollArea className="h-[calc(100vh-16rem)]">
                            <div className="space-y-4 pr-4">
                                {questionsWithVideos.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleQuestionSelect(item)}
                                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                            selectedQuestion.id === item.id 
                                                ? 'bg-blue-500/10 border border-blue-500/20' 
                                                : 'hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <h3 className="text-sm font-medium">
                                            {item.id}. {item.question}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}