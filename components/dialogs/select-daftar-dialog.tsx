"use client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SelectDaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const daftars = [
  { id: "tech-innovation", name: "Tech Innovation Fund" },
  { id: "sustainable-growth", name: "Sustainable Growth" },
]

export function SelectDaftarDialog({ open, onOpenChange }: SelectDaftarDialogProps) {
  const router = useRouter()

  const handleSelect = (daftarId: string) => {
    router.push(`/studio`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Select Daftar</h2>
            <p className="text-sm text-muted-foreground">Choose a daftar to submit your pitch</p>
          </div>

          <div className="space-y-2">
            {daftars.map((daftar) => (
              <Button
                key={daftar.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelect(daftar.id)}
              >
                <div>
                  <p className="font-medium">{daftar.name}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 