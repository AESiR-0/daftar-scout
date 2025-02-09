"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ArrowRight } from "lucide-react"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { useRouter } from "next/navigation"
import { CreateDaftarDialog } from "./create-daftar-dialog"

interface SelectDaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scoutSlug: string
}

interface CreateDaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (daftarId: string) => void
}

export function SelectDaftarDialog({ open, onOpenChange, scoutSlug }: SelectDaftarDialogProps) {
  const router = useRouter()
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false)

  const handleDaftarSelect = (daftarId: string) => {
    router.push(`/founder/studio?scout=${scoutSlug}?daftar=${daftarId}`)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-xl font-semibold mb-4">
            Select Pitch from Daftar
          </DialogTitle>

          <div className="space-y-4">
            <Button
              onClick={() => setCreateDaftarOpen(true)}
              className="w-full bg-muted hover:bg-muted/50"
            >New Daftar
            </Button>

            <div className="text-sm text-muted-foreground">
              or select from existing Daftars
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {daftarsData.map((daftar) => (
                  <button
                    key={daftar.id}
                    onClick={() => handleDaftarSelect(daftar.id)}
                    className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-medium">{daftar.name}</h3>
                     
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <CreateDaftarDialog
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
        onSuccess={(daftarId: string) => {
          router.push(`/founder/studio?daftar=${daftarId}`)
          handleDaftarSelect(daftarId)
          setCreateDaftarOpen(false)
        }}
      />
    </>
  )
} 