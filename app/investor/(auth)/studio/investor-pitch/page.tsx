"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Play, Upload, Trash2, Video, Info, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    { value: "urdu", label: "Urdu" }
  ],
  international: [
    { value: "english", label: "English" },
    { value: "mandarin", label: "Mandarin" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" }
  ]
}

export default function InvestorPitchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [showSample, setShowSample] = useState(true)

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 20MB",
          variant: "destructive"
        })
        return
      }
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
    }
  }

  const clearVideo = () => {
    setVideoUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadVideo = () => {
    if (!selectedLanguage) {
      toast({
        title: "Language required",
        description: "Please select a language for your video",
        variant: "destructive"
      })
      return
    }
    
    // Handle the actual upload here
    toast({
      title: "Video uploaded",
      description: "Your pitch video has been uploaded successfully"
    })
  }

  return (
    <Card className="border-none mt-4 container mx-auto px-4 bg-[#0e0e0e]">
      <CardContent className="pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Section: Video Upload */}
            <div className="col-span-2">
              <div className="space-y-4">
                {showSample ? (
                  <div className="border-2 flex flex-col border-dashed border-gray-700 rounded-lg p-6">
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <video
                        src="/videos/sample-pitch.mp4"
                        controls
                        poster="/images/sample-pitch-thumbnail.jpg"
                        className="w-full rounded-[0.35rem] aspect-video"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 flex flex-col border-dashed border-gray-700 rounded-lg p-6 text-center">
                    {videoUrl ? (
                      <div className="space-y-4">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full rounded-[0.35rem] aspect-video"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={clearVideo}
                            className="w-full"
                          >
                            Remove Video
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleUploadVideo}
                            className="w-full"
                          >
                            Upload Video
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={handleUpload}
                        className="cursor-pointer space-y-4"
                      >
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Video className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload your pitch video</p>
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
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowSample(!showSample)}
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
                    Your investment is more than just money, and your story with the founders
                    is more than a pitch. Share your vision to connect with founders who align
                    with your values.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A simple message about your 'why' can help you connect with founders who
                    share your values and are building a similar future.
                  </p>
                </div>
              </div>

           
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}