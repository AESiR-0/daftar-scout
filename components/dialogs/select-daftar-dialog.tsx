"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Daftar {
  id: string
  name: string
  description: string
}

const dummyDaftars: Daftar[] = [
  {
    id: "1",
    name: "Tech Startups",
    description: "Early-stage technology companies"
  },
  {
    id: "2", 
    name: "Healthcare Innovation",
    description: "Healthcare and biotech startups"
  },
  {
    id: "3",
    name: "Sustainable Energy",
    description: "Clean energy and sustainability focused ventures"
  }
]

interface SelectDaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNew: () => void
}

export function SelectDaftarDialog({ open, onOpenChange, onCreateNew }: SelectDaftarDialogProps) {
  const handleDaftarSelect = (daftarId: string) => {
    // Handle daftar selection
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Daftar</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {dummyDaftars.map((daftar) => (
              <div
                key={daftar.id}
                className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleDaftarSelect(daftar.id)}
              >
                <h3 className="font-medium">{daftar.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {daftar.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="gap-2"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}