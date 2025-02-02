"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { daftarsData } from "@/lib/dummy-data/daftars";

export type Offer = {
  id: string;
  type: "received" | "accepted" | "withdrawn";
  date: string;
  message: string;
  status: "pending" | "completed" | "withdrawn" | "rejected";
  user: string;
  designation: string;
  program: string;
  daftar: string;
};

// Convert daftars pitches to offers format
const initialOffers: Offer[] = daftarsData.flatMap(daftar => 
  daftar.pitches.map(pitch => ({
    id: pitch.id,
    type: pitch.status === "Offer Received" ? "received" : 
          pitch.status === "Accepted" ? "accepted" : 
          pitch.status === "Deal Cancelled" ? "withdrawn" : "received",
    date: pitch.date,
    message: `Investment offer for ${pitch.name}`,
    status: pitch.status === "Accepted" ? "completed" :
            pitch.status === "Rejected" ? "rejected" :
            pitch.status === "Deal Cancelled" ? "withdrawn" : "pending",
    user: pitch.postedBy,
    designation: daftar.team.members.find(m => m.name === pitch.postedBy)?.role || "Investment Manager",
    program: pitch.name,
    daftar: daftar.name
  }))
);

type OffersContextType = {
  offers: Offer[];
  updateOfferStatus: (id: string, type: "accepted" | "withdrawn", status: "completed" | "rejected") => void;
};

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);

  const updateOfferStatus = (id: string, type: "accepted" | "withdrawn", status: "completed" | "rejected") => {
    setOffers((prev) =>
      prev.map((offer) => (offer.id === id ? { ...offer, type, status } : offer))
    );
  };

  return (
    <OffersContext.Provider value={{ offers, updateOfferStatus }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error("useOffers must be used within an OffersProvider");
  }
  return context;
}

export function getStatusColor(type: string) {
  switch (type) {
    case "received": return "bg-blue-500/10 text-blue-500";
    case "accepted": return "bg-emerald-500/10 text-emerald-500";
    case "withdrawn": return "bg-red-500/10 text-red-500";
    default: return "bg-gray-500/10 text-gray-500";
  }
} 