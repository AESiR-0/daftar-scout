"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CalendarClock } from "lucide-react"

interface LaunchProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitFeedback: (feedback: string) => void
}

export function LaunchProgramDialog({ 
  open, 
  onOpenChange,
  onSubmitFeedback 
}: LaunchProgramDialogProps) {
  const [feedback, setFeedback] = useState("")

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmitFeedback(feedback)
      setFeedback("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Daftar OS Technology Update
            <span className="text-muted-foreground font-normal">
              December 20, 2024
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Update Message */}
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              We hope you're enjoying scouting startups with Daftar OS Technology. Currently, you're on Beta 1.1, where we're hyper-focused on enhancing the scouting experience.
            </p>
            
              <p className="text-sm">
                The incubation program will roll out its first update by February 6, 2025. All your selected startups will be seamlessly added to the Program Dashboard.
              </p>
              
            <p className="text-sm text-muted-foreground">
              For any feature requests or updates, feel free to share your feedback in the comment box below.
            </p>
            <p className="text-sm text-muted-foreground">
            Thank you for being part of our journey
          </p>
          </div>

          {/* Feedback Form */}
          <div className="space-y-2 flex flex-col items-center gap-2">
            <Textarea
              placeholder="Share your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSubmit}
              size="sm"
              className="bg-blue-600 w-fit hover:bg-blue-700 text-white"
            >
              Submit Feedback
            </Button>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  )
} 