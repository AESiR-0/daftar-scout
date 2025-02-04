"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Play, Upload, Trash2, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { QuestionsDialog } from "@/components/dialogs/questions-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Question {
  id: number
  question: string
  videoUrl?: string
  previewImage?: string
}

interface QuestionTemplate {
  name: string
  questions: Question[]
}

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

const questionsData = {
  defaultQuestions: [
    {
      id: 1,
      question: "What problem are you solving?",
      videoUrl: "/videos/problem.mp4",
      previewImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
    },
    {
      id: 2,
      question: "How big is the market opportunity?",
      videoUrl: "/videos/market.mp4",
      previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
    },
    {
      id: 3,
      question: "What's your unique solution?",
      videoUrl: "/videos/solution.mp4"
    },
    {
      id: 4,
      question: "Who is your target customer?",
      videoUrl: "/videos/customer.mp4"
    },
    {
      id: 5,
      question: "What's your business model?",
      videoUrl: "/videos/business.mp4"
    },
    {
      id: 6,
      question: "Who is on your team?",
      videoUrl: "/videos/team.mp4"
    }
  ],
  templates: {
    template1: [
      {
        id: 1,
        question: "What inspired you to start this venture?",
      },
      {
        id: 2,
        question: "What makes your solution unique?",
      },
      // Add more template questions...
    ]
  }
}

export default function FounderPitchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>(questionsData.defaultQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(questionsData.defaultQuestions[0])
  const [templates, setTemplates] = useState<Record<string, Question[]>>(questionsData.templates)
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "record">("preview")
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("english")

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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSamplePitch = () => {
    setCurrentQuestions(questionsData.defaultQuestions)
    setSelectedQuestion(questionsData.defaultQuestions[0])
    setRecordedVideo(null)
    setActiveTab("preview")
  }

  const handleQuestionsUpdate = (newQuestions: Question[]) => {
    const templateName = `template${Object.keys(templates).length + 1}`

    // Add new template
    setTemplates(prev => ({
      ...prev,
      [templateName]: newQuestions
    }))

    // Don't update current questions until "Add to Pitch" is clicked
    toast({
      title: "Template saved",
      description: "Click 'Add to Pitch' to use these questions"
    })
  }

  const applyTemplate = (templateQuestions: Question[]) => {
    const updatedQuestions = templateQuestions.map((q, index) => ({
      ...q,
      videoUrl: currentQuestions[index]?.videoUrl,
      previewImage: currentQuestions[index]?.previewImage
    }))

    setCurrentQuestions(updatedQuestions)
    setSelectedQuestion(updatedQuestions[0])
    setQuestionsOpen(false)
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
        <div className="mb-6 p-4 bg-blue-600/10 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Instructions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• You must create exactly 6 questions for your pitch</li>
            <li>• Each question must be filled out</li>
            <li>• Click "Sample Pitch" to use our recommended questions</li>
            <li>• Create custom questions and save them as templates</li>
            <li>• Use "Add to Pitch" to apply your custom questions</li>
          </ul>
        </div>


        <div className="grid grid-cols-3 gap-8">
          {/* Left Section: Video + Tabs */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="preview" onValueChange={(value) => setActiveTab(value as "preview" | "record")}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="record">Record</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSamplePitch}>
                    Sample Pitch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestionsOpen(true)}
                  >
                    Custom Questions
                  </Button>
                </div>
              </div>

              <TabsContent value="preview" className="mt-0">
                <div className="aspect-video bg-muted rounded-lg relative group overflow-hidden">
                  {recordedVideo || selectedQuestion.videoUrl ? (
                    <>
                      <video
                        src={recordedVideo || selectedQuestion.videoUrl}
                        poster={selectedQuestion.previewImage}
                        className="w-full h-full object-cover"
                        controls
                      />
                      {recordedVideo && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80"
                          onClick={clearVideo}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0">
                      <img
                        src={selectedQuestion.previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="record" className="mt-0">
                <div className="aspect-video bg-muted rounded-lg relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Recording in progress..." : "Click to record or upload your video answer"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
                      >
                        {isRecording ? "Stop Recording" : "Record"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleUpload}>
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
            {/* Description Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-medium">Why Video Pitching?</h2>
              <p className="text-sm text-muted-foreground">
                Pitch OS helps founders connect through video pitches in the language they're most comfortable with. By understanding the "why" and "what" of a founder's journey, it becomes easier to decide whether to meet them in person and offer support.
              </p>
              <p className="text-sm text-muted-foreground">
                We've reviewed thousands of startups and investors to create a set of simple questions that help your screening team quickly understand the founder's journey before deciding to meet.
              </p>
              <p className="text-sm text-muted-foreground">
                As a Daftar OS Elite member, you can fully customize these questions to match your investment or startup support program.
              </p>
            </div>
          </div>

          {/* Right Section: Questions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Questions</h3>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {currentQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`flex gap-3 items-start p-4 rounded-lg cursor-pointer transition-colors ${selectedQuestion.id === question.id
                      ? 'bg-blue-600/10 border border-blue-600'
                      : 'bg-muted/50 hover:bg-muted/70 border border-transparent'
                      }`}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <span className="text-xs font-medium text-blue-600 mt-0.5">
                      {String(question.id).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{question.question}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={() => router.push("/investor/studio/investor-pitch")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </CardContent>

      <QuestionsDialog
        open={questionsOpen}
        onOpenChange={setQuestionsOpen}
        onQuestionsUpdate={handleQuestionsUpdate}
        onApplyTemplate={applyTemplate}
        templates={templates}
      />
    </Card>
  )
}