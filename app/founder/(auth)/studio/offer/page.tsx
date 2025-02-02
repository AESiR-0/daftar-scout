"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { OffersProvider, useOffers, type Offer } from "./context/offers-context";
import { OfferCard } from "./components/offer-card";
import { OfferDetailModal } from "./components/offer-detail-modal";
import { OffersHeader } from "./components/offers-header";
import { StudioContainer } from "../components/layout/studio-container";

function OfferContent() {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { offers, updateOfferStatus } = useOffers();
  const { toast } = useToast();

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "rejected") => {
    updateOfferStatus(id, type, status);
    setSelectedOffer(null);

    toast({
      title: `Offer ${status === "completed" ? "Accepted" : "Rejected"}`,
      description: `The offer from ${offers.find((o) => o.id === id)?.daftar} has been ${status}.`,
      variant: type === "accepted" ? "success" : "destructive",
    });
  };

  const pendingCount = offers.filter(o => o.status === "pending").length;

  return (
    <StudioContainer>
      <OffersHeader pendingCount={pendingCount} />
      
      <ScrollArea className="flex-grow">
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onView={setSelectedOffer}
              onAccept={(id) => handleStatusUpdate(id, "accepted", "completed")}
              onDecline={(id) => handleStatusUpdate(id, "withdrawn", "rejected")}
            />
          ))}
        </div>
      </ScrollArea>

      <OfferDetailModal
        offer={selectedOffer}
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onAccept={(id) => handleStatusUpdate(id, "accepted", "completed")}
        onDecline={(id) => handleStatusUpdate(id, "withdrawn", "rejected")}
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
