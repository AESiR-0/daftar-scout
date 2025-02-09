"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Play, Upload, Trash2, Video, Info } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<"preview" | "record">("preview")
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 100MB",
          variant: "destructive"
        })
        return
      }
      const url = URL.createObjectURL(file)
      setRecordedVideo(url)
      setActiveTab("preview")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedVideo(url)
        setActiveTab("preview")
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording",
      })
    } catch (error) {
      toast({
        title: "Permission denied",
        description: "Please allow camera and microphone access to record",
        variant: "destructive"
      })
    }
  }
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const clearVideo = () => {
    setRecordedVideo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardContent className="pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Section: Video + Recording */}
            <div className="col-span-2 space-y-6">
              <Tabs defaultValue="preview" onValueChange={(value) => setActiveTab(value as "preview" | "record")}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="record">Record</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="mt-0">
                  <div className="aspect-video bg-muted rounded-lg relative group overflow-hidden">
                    {recordedVideo ? (
                      <>
                        <video
                          src={recordedVideo}
                          className="w-full h-full object-cover"
                          controls
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-background/80 hover:bg-background/90"
                            onClick={clearVideo}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="p-4 rounded-full mb-4">
                          <Upload className="h-8 w-8 " />
                        </div>
                        <p className="text-sm font-medium">Upload your investor pitch video</p>
                        <p className="text-xs text-muted-foreground mt-1">MP4, WebM or Ogg (max. 100MB)</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="record" className="mt-0">
                  <div className="aspect-video bg-muted rounded-lg relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="p-4 rounded-full ">
                        <Video className="h-8 w-8 " />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {isRecording ? "Recording in progress..." : "Record your pitch"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Share your vision with potential founders
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={cn(
                            "min-w-[100px]",
                            isRecording && "animate-pulse"
                          )}
                        >
                          {isRecording ? "Stop" : "Record"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUpload}
                          className="min-w-[100px]"
                        >
                          Upload
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Section: Info */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 ">
                  <Info className="h-5 w-5" />
                  <h2 className="font-medium">Why Share Your Vision?</h2>
                </div>
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

              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Select Pitch Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Indian Languages</h4>
                      {LANGUAGES.indian.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                      <h4 className="text-sm font-medium mb-2 mt-4 text-muted-foreground">International Languages</h4>
                      {LANGUAGES.international.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
           
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}