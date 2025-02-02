"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollText } from "lucide-react"

interface JournalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
  const [note, setNote] = useState("")

  // Load saved note when dialog opens
  useEffect(() => {
    if (open) {
      const savedNote = localStorage.getItem("journal")
      if (savedNote) setNote(savedNote)
    }
  }, [open])

  // Auto-save whenever note changes
  useEffect(() => {
    const saveNote = () => {
      localStorage.setItem("journal", note)
      console.log("Auto-saving note...")
    }

    const debounceTimer = setTimeout(saveNote, 500) // Debounce save for 500ms
    return () => clearTimeout(debounceTimer)
  }, [note])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex flex-col h-[28rem]">
          <div className="flex items-center gap-2 p-4">
            <ScrollText className="h-4 w-4" />
            <h2 className="text-sm font-medium">Journal</h2>
          </div>

          <div className="flex-1 p-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts here..."
              className="h-full text-sm resize-none border-0 focus-visible:ring-0"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 