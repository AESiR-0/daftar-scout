"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EndScoutingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function EndScoutingDialog({ open, onOpenChange, onConfirm }: EndScoutingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>End Scouting?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to end the scouting process?</p>
            <div className="mt-4 p-3 bg-muted rounded-[0.3rem] text-sm">
              <p className="font-medium mb-2">Note:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All applications on hold will be moved to rejected</li>
                <li>Meetings can still take place</li>
                <li>All inbox applications will be declined</li>
                <li>All sent invites will be cancelled</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-6">
          <Button 
            size="sm"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            End Scouting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 