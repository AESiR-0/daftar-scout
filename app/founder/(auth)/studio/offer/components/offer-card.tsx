import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import { type Offer, getStatusColor } from "../context/offers-context";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: Offer;
  onView: (offer: Offer) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onWithdraw: (id: string) => void;
  showWithdrawOption: boolean;
}

export function OfferCard({ offer, onView, onAccept, onDecline, onWithdraw, showWithdrawOption }: OfferCardProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
    },
    completed: {
      label: "Accepted",
      className: "bg-green-50 text-green-800 ring-green-600/20"
    },
    rejected: {
      label: "Declined",
      className: "bg-red-50 text-red-800 ring-red-600/20"
    }
  };

  const status = statusConfig[offer.status];

  return (
    <div
      className="group relative rounded-lg border border-muted bg-card p-5 transition-all hover:shadow-md cursor-pointer"
      onClick={() => onView(offer)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary"
              className={`${getStatusColor(offer.type)} border-0`}
            >
              {offer.type}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {offer.date}
            </div>
          </div>
          <h3 className="font-medium leading-none mt-2">{offer.daftar}</h3>
          <p className="text-sm text-muted-foreground mt-2">{offer.message}</p>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-4 flex items-center text-xs text-muted-foreground">
        <span className="flex items-center">
          {offer.user} · {offer.designation} · {offer.program}
        </span>
      </div>

      <span className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        status.className
      )}>
        {status.label}
      </span>

      {offer.status === "pending" && (
        <div className="mt-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={() => onDecline(offer.id)}
          >
            Decline
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            onClick={() => onAccept(offer.id)}
          >
            Accept Offer
          </Button>
        </div>
      )}
    </div>
  );
} 