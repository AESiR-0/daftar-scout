"use client";

import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Video, Upload } from "lucide-react";
import { uploadVideoToS3, getVideoUrl } from "@/lib/s3";

interface VideoItem {
    key: string;
    url: string;
    name: string;
    uploadedAt: Date;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export default function UploadS3Page() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "Error",
                description: "File size must be less than 50MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Generate a unique key for the video
            const key = `videos/${Date.now()}-${file.name}`;

            // Upload to S3
            const url = await uploadVideoToS3(file, key);

            // Add to videos list
            setVideos(prev => [...prev, {
                key,
                url,
                name: file.name,
                uploadedAt: new Date()
            }]);

            toast({
                title: "Success",
                description: "Video uploaded successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to upload video",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRefreshUrl = async (key: string) => {
        try {
            const newUrl = await getVideoUrl(key);
            setVideos(prev => prev.map(video =>
                video.key === key ? { ...video, url: newUrl } : video
            ));
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to refresh video URL",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold">Video Upload</h1>

            {/* Upload Section */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="video/*"
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Select Video
                        </Button>
                    </div>

                    <p className="text-sm text-gray-500">
                        Maximum file size: 50MB. Supported formats: MP4, WebM, MOV
                    </p>

                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-gray-500">Uploading video...</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Video Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <Card key={video.key} className="p-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                            <video
                                src={video.url}
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium truncate">{video.name}</p>
                            <p className="text-sm text-gray-500">
                                Uploaded: {video.uploadedAt.toLocaleString()}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefreshUrl(video.key)}
                                className="w-full"
                            >
                                Refresh URL
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {videos.length === 0 && (
                <div className="text-center py-12">
                    <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No videos uploaded yet</p>
                </div>
            )}
        </div>
    );
}
