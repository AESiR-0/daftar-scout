import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Complete Payment</DialogTitle>
        <div className="grid gap-4 py-4">
          {/* Add payment form fields here */}
          <Button className="w-full bg-muted hover:bg-muted/50">
            Pay Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 