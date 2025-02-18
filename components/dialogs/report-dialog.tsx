"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"

const reportReasons = [
  { id: "false-claim", label: "False Claims" },
  { id: "scam", label: "Scam" },
  { id: "fraud", label: "Fraud" },
  { id: "plagiarism", label: "Plagiarism" },
  { id: "violence", label: "Violence" },
  { id: "threat", label: "Threat" },
  { id: "offensive", label: "Offensive Content" },
  { id: "illegal", label: "Illegal Activities" },
  { id: "cyberbully", label: "Cyberbullying" },
  { id: "nudity", label: "Nudity" },
  { id: "abusive", label: "Abusive Language" },
  { id: "deepfake", label: "Deep Fake" },
  { id: "misleading", label: "Misleading Data" }
]

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [customReason, setCustomReason] = useState("")
  const [customReasons, setCustomReasons] = useState<string[]>([])

  const handleSubmit = () => {
    console.log("Reported reasons:", selectedReasons)
    setIsSubmitted(true)
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setSelectedReasons([])
    onOpenChange(false)
  }

  const handleAddCustomReason = () => {
    if (customReason.trim()) {
      setCustomReasons([...customReasons, customReason.trim()])
      setSelectedReasons([...selectedReasons, customReason.trim()])
      setCustomReason("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Report Startup</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Red flag this startup and help Daftar build a better startup ecosystem
              </p>

              <div className="gap-3">
                {reportReasons.map((reason) => (
                  <div key={reason.id} className="flex items-center py-1 space-x-2">
                    <Checkbox 
                      id={reason.id}
                      className="border-gray-500"
                      checked={selectedReasons.includes(reason.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReasons([...selectedReasons, reason.id])
                        } else {
                          setSelectedReasons(selectedReasons.filter(id => id !== reason.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={reason.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {reason.label}
                    </label>
                  </div>
                ))}

                {customReasons.map((reason) => (
                  <div key={reason} className="flex items-center py-1 space-x-2">
                    <Checkbox 
                      id={reason}
                      className="border-gray-500"
                      checked={selectedReasons.includes(reason)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReasons([...selectedReasons, reason])
                        } else {
                          setSelectedReasons(selectedReasons.filter(id => id !== reason))
                        }
                      }}
                    />
                    <label className="text-sm font-medium leading-none">
                      {reason}
                    </label>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="Add another reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomReason()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleAddCustomReason}
                    disabled={!customReason.trim()}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Report
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <p className="text-sm leading-relaxed">
            We are carefully analyzing the data patterns that led to this startup being red-flagged. As we continue enhancing our intelligence to help you connect with better founders in the future, we hope you find our software valuable.<br/><br/>If not, we'd love to hear your feedback, we're always listening
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 