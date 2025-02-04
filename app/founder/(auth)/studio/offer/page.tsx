"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { OffersProvider, useOffers, type Offer } from "./context/offers-context";
import { OfferCard } from "./components/offer-card";
import { OfferDetailModal } from "./components/offer-detail-modal";
import { OffersHeader } from "./components/offers-header";
import { StudioContainer } from "../components/layout/studio-container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function OfferContent() {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { offers, updateOfferStatus } = useOffers();
  const { toast } = useToast();

  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "rejected" | "withdrawn">("all");

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "rejected") => {
    updateOfferStatus(id, type, status);
    setSelectedOffer(null);

    toast({
      title: `Offer ${status === "completed" ? "Accepted" : "Rejected"}`,
      description: `The offer from ${offers.find((o) => o.id === id)?.daftar} has been ${
        status === "completed" ? "accepted" : "rejected"
      }.`,
      variant: type === "accepted" ? "success" : "destructive",
    });
  };

  const handleWithdrawAcceptedOffer = (id: string) => {
    updateOfferStatus(id, "withdrawn", "rejected");
    setSelectedOffer(null);
    
    toast({
      title: "Offer Withdrawn",
      description: `The offer has been withdrawn successfully.`,
      variant: "default",
    });
  };

  const pendingOffers = offers.filter(o => o.status === "pending");
  const logOffers = offers.filter(o => {
    if (historyFilter === "all") return o.status !== "pending";
    if (historyFilter === "withdrawn") return o.type === "withdrawn";
    return o.status === historyFilter;
  });
  const pendingCount = pendingOffers.length;

  return (
    <StudioContainer>
      <OffersHeader pendingCount={pendingCount} />
      
      {/* Pending Offers Section */}
      <div className={cn(
        "mb-8",
        pendingCount === 0 ? "p-2" : ""
      )}>
        <h2 className="text-lg font-semibold mb-4">
          Pending Offers 
          <span className="ml-2 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            {pendingCount}
          </span>
        </h2>
        <ScrollArea className={cn(
          "transition-all duration-200",
          pendingCount === 0 ? "h-16" : "h-[300px]"
        )}>
          <div className="space-y-3 pr-4">
            {pendingOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onView={setSelectedOffer}
                onAccept={(id) => handleStatusUpdate(id, "accepted", "completed")}
                onDecline={(id) => handleStatusUpdate(id, "withdrawn", "rejected")}
              />
            ))}
            {pendingOffers.length === 0 && (
              <p className="text-muted-foreground text-center py-2">No pending offers</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Offer History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Offer History</h2>
          <Select value={historyFilter} onValueChange={(value: "all" | "completed" | "rejected" | "withdrawn") => setHistoryFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All History</SelectItem>
              <SelectItem value="completed">Accepted</SelectItem>
              <SelectItem value="rejected">Declined</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-80">
          <div className="space-y-3 pr-4">
            {logOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onView={setSelectedOffer}
                onWithdraw={offer.status === "completed" ? handleWithdrawAcceptedOffer : undefined}
                showWithdrawOption={true}
              />
            ))}
            {logOffers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No offer history</p>
            )}
          </div>
        </ScrollArea>
      </div>

      <OfferDetailModal
        offer={selectedOffer}
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onAccept={(id) => handleStatusUpdate(id, "accepted", "completed")}
        onDecline={(id) => handleStatusUpdate(id, "withdrawn", "rejected")}
        onWithdraw={selectedOffer?.status === "completed" ? handleWithdrawAcceptedOffer : undefined}
        showWithdrawOption={true}
      />
    </StudioContainer>
  );
}

export default function OffersPage() {
  return (
    <OffersProvider>
      <OfferContent />
    </OffersProvider>
  );
}
