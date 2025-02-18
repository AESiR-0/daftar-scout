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

export default function InvestorQuestionsPage() {
    const [questionId, setQuestionId] = useState(questions[0]?.id);
    const [language, setLanguage] = useState("English");
    const [previewUrl, setPreviewUrl] = useState<string>("");
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
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleUploadVideo(e, questionId)}
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
                                    onChange={(e) => handleFileChange(e, questionId)}
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
                                {questions.map((item) => (
                                    <div
                                        key={item.id}
                                        className=""
                                    >
                                        <h3 className="text-sm font-medium">{item.id}. {item.question}</h3>
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