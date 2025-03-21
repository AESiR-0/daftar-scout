"use client"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoDialog({ open, onOpenChange }: VideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="flex gap-6 p-6">
          {/* Left: Video and Details */}
          <div className="flex-[2] space-y-4">
            <Card className="aspect-video overflow-hidden border-0 bg-muted/50">
              <video
                className="w-full h-full object-cover"
                controls
                poster="/assets/torricke-barton.jpg"
              >
                <source src="/assets/torricke-barton.mp4" type="video/mp4" />
              </video>
            </Card>
            <div className="space-y-1">
              <h3 className="font-medium">John Smith</h3>
              <p className="text-sm text-muted-foreground">Chief Investment Officer</p>
              <p className="text-sm text-muted-foreground">Published 2024</p>
            </div>
          </div>

          {/* Right: Description */}
          <div className="flex-1 space-y-4">
            <div className="pt-[14rem]">
              <h2 className="text-xl font-semibold mb-2">Demo</h2>
              <p className="text-muted-foreground">
                Daftar's Support to Scaling Your Scout
                Startup's at Daftar
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 