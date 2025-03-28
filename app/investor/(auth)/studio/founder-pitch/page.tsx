  "use client"

  import { useState, useRef } from "react"
  import { Button } from "@/components/ui/button"
  import { useRouter } from "next/navigation"
  import { Play, Upload, Trash2, Video, Info } from "lucide-react"
  import { Card, CardContent } from "@/components/ui/card"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { useToast } from "@/hooks/use-toast"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import {  
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
  } from "@/components/ui/hover-card"
  import { Checkbox } from "@/components/ui/checkbox"

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
        question: "Introduce yourself",
        videoUrl: "/videos/problem.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
      },
      {
        id: 2,
        question: "How did you come up with the idea  ",
        videoUrl: "/videos/market.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
      },
      {
        id: 3,
        question: "What is the problem are you solving, and why is it really important for you to solve it",
        videoUrl: "/videos/solution.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
      },
      {
        id: 4,
        question: "Who are your customers, and why would they pay for it",
        videoUrl: "/videos/customer.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
      },
      {
        id: 5,
        question: "How much have you worked on your startup, and where do you see it in 3 years",
        videoUrl: "/videos/business.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
      },
      {
        id: 6,
        question: "What challenges are you facing, and what support do you need",
        videoUrl: "/videos/team.mp4",
        previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
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
    const [selectedOption, setSelectedOption] = useState<"sample" | "custom" | null>(null)
    const [customQuestions, setCustomQuestions] = useState<Question[]>(
      Array(6).fill(null).map((_, i) => ({
        id: i + 1,
        question: "",
      }))
    )
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<Question>(questionsData.defaultQuestions[0])
    const [templates, setTemplates] = useState<Record<string, Question[]>>(questionsData.templates)
    const [questionsOpen, setQuestionsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"preview" | "record">("preview")
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState("english")

    const handleOptionChange = (option: "sample" | "custom") => {
      if (selectedOption === option) {
        setSelectedOption(null)
      } else {
        setSelectedOption(option)
      }
    }

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
    const [templateName, setTemplateName] = useState("template1")

    const handleQuestionsUpdate = (newQuestions: Question[], templateName: string) => {
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

    const handleDeleteTemplate = (templateName: string) => {
      setTemplates(prev => {
        const newTemplates = { ...prev }
        delete newTemplates[templateName]
        return newTemplates
      })

      toast({
        title: "Template deleted",
        description: "The template has been removed",
      })
    }

    return (
      <ScrollArea className="h-full w-full">
      <Card className="border-none my-4 container mx-auto px-4 h-[80vh] bg-[#0e0e0e]">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Header with Info Icon and Sample Questions */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <h2 className="text-lg font-medium">Create Custom Questions for Founder's Pitch</h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-[700px] p-4">
                    <div className=" flex gap-4">
                      <div className="w-1/3 flex mt-8 justify-center items-center">
                        <video
                          src={selectedQuestion.videoUrl}
                          poster={selectedQuestion.previewImage}
                          className="w-[250px] h-[225px] object-cover"
                          controls
                        />
                      </div>
                      <div className="w-2/3">
                        <h3 className="text-sm font-medium">Why Video Pitching?</h3>
                        <p className="text-sm mt-2 text-muted-foreground">
                          Pitch OS helps founders connect through video pitches in the language they're most comfortable with. By understanding the "why" and "what" of a founder's journey, it becomes easier to decide whether to meet them in person and offer support.
                        </p><br/>
                        <p className="text-sm text-muted-foreground">
                          We've reviewed thousands of startups and investors to create a set of simple questions that help your screening team quickly understand the founder's journey before deciding to meet.
                        </p><br/>
                        <p className="text-sm text-muted-foreground">
                          As a Daftar OS Elite member, you can fully customize these questions to match your investment or startup support program.
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            {/* Video and Questions side by side */}
            <div className="flex gap-6">
              {/* Left Column - Video Preview */}
              <div className="flex flex-col">
                <div className="w-[1/3] aspect-video bg-muted rounded-lg relative group overflow-hidden h-[250px]">
                  {selectedQuestion.videoUrl ? (
                    <video
                      src={selectedQuestion.videoUrl}
                      poster={selectedQuestion.previewImage}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-sm text-muted-foreground">
                        Select a question to view sample response
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Language: English
                </p>
              </div>

              {/* Right Column - Sample Questions Preview */}
              <div className="space-y-2">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2 pr-4">
                    {questionsData.defaultQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="px-1 rounded-[0.35rem] py-1 cursor-pointer hover:underline transition-colors"
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <p className={`text-sm font-medium ${selectedQuestion.id === question.id ? '' : ''}`}>
                          {question.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Checkboxes and Questions Card */}
            <div className="grid grid-cols-4 gap-6">
              {/* Checkboxes */}
              <div className="space-y-4">
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

              {/* Questions Card */}
            <div className="space-y-4 col-span-3">
              <div className="border rounded-lg p-4 bg-muted/50">
                {/* Conditionally apply ScrollArea and height based on screen size */}
                <div className="lg:h-auto h-[200px]">
                  <ScrollArea className="lg:h-auto h-full">
                    {selectedOption === null ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Select an option to view or create questions
                      </div>
                    ) : selectedOption === "sample" ? (
                      <div className="space-y-3">
                        {questionsData.defaultQuestions.map((question, index) => (
                          <div key={question.id} className="flex gap-3 items-start">
                            <span className="text-xs font-medium mt-2">
                              {String(index + 1)}.
                            </span>
                            <p className="text-sm mt-1">{question.question}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customQuestions.map((question, index) => (
                          <div key={question.id} className="flex gap-3 items-start">
                            <span className="text-xs font-medium mt-2">
                              {String(index + 1)}.
                            </span>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => {
                                const updatedQuestions = [...customQuestions];
                                updatedQuestions[index].question = e.target.value;
                                setCustomQuestions(updatedQuestions);
                              }}
                              placeholder={`Enter question ${index + 1}...`}
                              className="flex-1 bg-background rounded-md p-2 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </ScrollArea>
    )
  }