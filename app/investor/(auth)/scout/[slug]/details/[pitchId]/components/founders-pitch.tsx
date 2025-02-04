"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Flag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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
]

interface FoundersPitch {
    status: string
    location: string
    sectors: string[]
    demoLink?: string
    stage: string
    founderQuestions?: {
        question: string
        answer: string
    }[]
    questions: {
        id: number
        question: string
        videoUrl: string
    }[]
}

interface FoundersPitchSectionProps {
    pitch: FoundersPitch
    onScheduleMeeting: () => void
}

const defaultQuestions = [
    { id: 1, question: "What inspired you to start this venture?" },
    { id: 2, question: "What problem are you solving and for whom?" },
    { id: 3, question: "What's your unique value proposition?" },
    { id: 4, question: "Who are your competitors and what's your advantage?" },
    { id: 5, question: "What's your business model and go-to-market strategy?" },
    { id: 6, question: "What are your funding requirements and use of funds?" },
]

export function FoundersPitchSection({ pitch, onScheduleMeeting }: FoundersPitchSectionProps) {
    const [selectedQuestion, setSelectedQuestion] = useState(defaultQuestions[0])
    const [showReportDialog, setShowReportDialog] = useState(false)
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleReasonToggle = (reasonId: string) => {
        setSelectedReasons(prev =>
            prev.includes(reasonId)
                ? prev.filter(id => id !== reasonId)
                : [...prev, reasonId]
        )
    }

    const handleReport = async () => {
        if (selectedReasons.length === 0) return
        setIsSubmitting(true)

        try {
            // Add your API call here
            await fetch('/api/report-founder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reasons: selectedReasons,
                })
            })

            setShowReportDialog(false)
            setSelectedReasons([])
            toast({
                title: "Report Submitted",
                description: "Thank you for helping us maintain a better ecosystem.",
                variant: "success",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit report. Please try again.",
                variant: "destructive",
            })
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedVideo = pitch.questions.find(q => q.id === selectedQuestion.id)?.videoUrl

    return (
        <Card className="w-full border-none my-0 p-0 bg-[#0e0e0e]">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Founder's Pitch</CardTitle>
                        <CardDescription>
                            Curated questions by the investors to help understand the startup better.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowReportDialog(true)}
                        >
                            <Flag className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button onClick={onScheduleMeeting} variant="outline">
                            Schedule Meeting
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="border-none">
                <div className="flex justify-between gap-10">
                    {/* Left side - Video Player and Details */}
                    <div className="w-1/2">
                        <div className="space-y-4">
                            {selectedVideo ? (
                                <div className="space-y-4">
                                    <video
                                        src={selectedVideo}
                                        controls
                                        className="w-full rounded-[0.3rem] aspect-video bg-muted"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-muted rounded-[0.3rem] flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">No video available</p>
                                </div>
                            )}

                            {/* Founder Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#1f1f1f] rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                                    <Badge variant="secondary">{pitch.status}</Badge>
                                </div>
                                <div className="p-4 bg-[#1f1f1f] rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Stage</p>
                                    <Badge variant="secondary">{pitch.stage}</Badge>
                                </div>
                                <div className="p-4 bg-[#1f1f1f] rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Location</p>
                                    <p className="text-sm">{pitch.location}</p>
                                </div>
                                {pitch.demoLink && (
                                    <div className="p-4 bg-[#1f1f1f] rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Demo</p>
                                        <a
                                            href={pitch.demoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            View Demo
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Sectors */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Sectors</p>
                                <div className="flex flex-wrap gap-2">
                                    {pitch.sectors.map((sector) => (
                                        <Badge key={sector} variant="outline">{sector}</Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Founder's Specific Questions */}
                            {pitch.founderQuestions && pitch.founderQuestions.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">Founder's Responses</p>
                                    <div className="space-y-3">
                                        {pitch.founderQuestions.map((item, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-[#1f1f1f] rounded-lg space-y-2"
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

                    {/* Right side - Questions List */}
                    <div className="w-1/2">
                        <ScrollArea className="h-[calc(100vh-16rem)]">
                            <div className="space-y-4 pr-4">
                                {defaultQuestions.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "p-4 rounded-[0.3rem] cursor-pointer transition-colors",
                                            selectedQuestion.id === item.id
                                                ? "bg-blue-500/10 text-blue-500"
                                                : "bg-muted/50 hover:bg-muted/70"
                                        )}
                                        onClick={() => setSelectedQuestion(item)}
                                    >
                                        <h3 className="text-sm font-medium">{item.question}</h3>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>

            {/* Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Report</DialogTitle>
                        <DialogDescription>
                            Red flag this startup and help Daftar build a better startup ecosystem.
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
                        </div></ScrollArea>
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
    )
} 