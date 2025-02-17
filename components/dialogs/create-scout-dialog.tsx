"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CreateScoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScoutCreate: (scoutName: string) => void
}

export function CreateScoutDialog({ open, onOpenChange, onScoutCreate }: CreateScoutDialogProps) {
  const [scoutName, setScoutName] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!scoutName.trim()) {
      toast({
        title: "Scout name is required",
        variant: "destructive"
      })
      return
    }

    onScoutCreate(scoutName)
    setScoutName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Scout</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter scout name"
              value={scoutName}
              onChange={(e) => setScoutName(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>Create Scout</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 