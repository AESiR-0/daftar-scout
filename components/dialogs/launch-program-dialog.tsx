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

export function LaunchProgramDialog({ open, onOpenChange, onSubmitFeedback }: LaunchProgramDialogProps) {
  const [response, setResponse] = useState<"accept" | "decline" | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          {/* Update Message */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Program feature is rolling out soon, and your scouted startups will be added to the program list.
            </p>
            <p className="text-sm text-muted-foreground ">
              By the way, we'd love your experience to help build and test the program feature. If you're interested and have some time, we'd love your insights into building or testing the feature.
            </p>
          </div>

          {!response ? (
            <div className="flex gap-3">
              <Button 
                onClick={() => setResponse("accept")}
                className="bg-blue-600 rounded-[0.35rem] hover:bg-blue-700"
              >
                Sure, count me in… anything for the community
              </Button>
              <Button 
                variant="outline"
                className="rounded-[0.35rem] hover:bg-muted/50"
                onClick={() => setResponse("decline")}
              >
                No, keep me out
              </Button>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm">
                {response === "accept" 
                  ? "Hey, thanks. We'll get back to you as soon as possible to learn from your experience and build a product that will help every investor and startup on Daftar."
                  : "That's okay. We understand and appreciate your time. If anything changes, feel free to reach out via support."
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 