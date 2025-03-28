"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface SelectDaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scoutSlug: string
}

export function SelectDaftarDialog({ open, onOpenChange, scoutSlug }: SelectDaftarDialogProps) {
  const router = useRouter()
  const [pitchName, setPitchName] = useState("")

  const handleSubmit = () => {
    if (pitchName.trim()) {
      router.push(`/founder/studio?scout=${scoutSlug}&pitch=${pitchName}`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-xl font-semibold mb-4">
          New Pitch
        </DialogTitle>

        <div className="space-y-4">
          <Input
            placeholder="Enter pitch name"
            value={pitchName}
            onChange={(e) => setPitchName(e.target.value)}
          />
          <Button 
            className="w-full rounded-[0.35rem]" 
            onClick={handleSubmit}
            disabled={!pitchName.trim()}
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 