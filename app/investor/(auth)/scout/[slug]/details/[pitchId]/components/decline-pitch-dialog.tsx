"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface DeclinePitchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDecline: (reason: string) => Promise<void>
}

export function DeclinePitchDialog({
  open,
  onOpenChange,
  onDecline,
}: DeclinePitchDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    
    setIsSubmitting(true)
    try {
      await onDecline(reason)
      onOpenChange(false)
      setReason("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline Pitch</DialogTitle>
          <DialogDescription>
            Please provide a reason for declining this pitch. This feedback will be shared with the founder.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter your reason for declining..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[150px] bg-[#1f1f1f] border-[#2a2a2a]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Declining..." : "Decline Pitch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 