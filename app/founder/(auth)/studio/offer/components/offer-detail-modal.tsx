import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Building2, User, Briefcase } from "lucide-react";
import { type Offer, getStatusColor } from "../context/offers-context";

interface OfferDetailModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onWithdraw?: (id: string) => void;
  showWithdrawOption?: boolean | undefined;
}

export function OfferDetailModal({
  offer,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  onWithdraw,
  showWithdrawOption = false,
}: OfferDetailModalProps) {
  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{offer.daftar}</span>
            <Badge variant="secondary" className={getStatusColor(offer.type)}>
              {offer.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            {offer.date}
          </div>

          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{offer.message}</p>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{offer.user}</span>
                <span className="text-muted-foreground ml-2">· {offer.designation}</span>
              </div>

              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{offer.program}</span>
              </div>

              <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{offer.daftar}</span>
              </div>
            </div>
          </div>

          {offer.status === "pending" && (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => onDecline?.(offer.id)}
              >
                Decline
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                onClick={() => onAccept?.(offer.id)}
              >
                Accept Offer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 