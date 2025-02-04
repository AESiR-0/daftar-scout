"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { daftarsData } from "@/lib/dummy-data/daftars";

// Define Offer Type
export type OfferType = string | any;
export type OfferStatus = "pending" | "completed" | "rejected" | "withdrawn";

export interface Offer {
  id: string;
  type: OfferType;
  date: string;
  message: string;
  status: OfferStatus;
  user: string;
  designation: string;
  program: string;
  daftar: string;
}

type PitchStatus = 
  | "Accepted" 
  | "Pending" 
  | "Rejected" 
  | "Pitched" 
  | "Scout Interested" 
  | "Not Matched" 
  | "Planning"
  | "Offer Received"
  | "Deal Cancelled";

// Convert daftars pitches to offers format
const initialOffers: Offer[] = daftarsData.flatMap((daftar) =>
  daftar.pitches.map((pitch) => {
    let type: OfferType;
    let status: OfferStatus;

    if (pitch.status as PitchStatus === "Offer Received") {
      type = "received";
    } else if (pitch.status as PitchStatus === "Accepted") {
      type = "accepted";
    } else if (pitch.status as PitchStatus === "Deal Cancelled") {
      type = "withdrawn";
    } else {
      type = "received";
    }

    if (pitch.status as PitchStatus === "Accepted") {
      status = "completed";
    } else if (pitch.status as PitchStatus === "Rejected") {
      status = "rejected";
    } else if (pitch.status as PitchStatus === "Deal Cancelled") {
      status = "withdrawn";
    } else {
      status = "pending";
    }

    let designation = "Investment Manager";
    if (daftar.team?.members) {
      const foundMember = daftar.team.members.find((m) => m.name === pitch.postedBy);
      if (foundMember) {
        designation = foundMember.role;
      }
    }

    return {
      id: pitch.id,
      type,
      date: pitch.date,
      message: `Investment offer for ${pitch.name}`,
      status,
      user: pitch.postedBy,
      designation,
      program: pitch.name,
      daftar: daftar.name,
    };
  })
);

interface OffersContextType {
  offers: Offer[];
  updateOfferStatus: (id: string, type: OfferType, status: OfferStatus) => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);

  const updateOfferStatus = (id: string, type: OfferType, status: OfferStatus) => {
    setOffers((prev) =>
      prev.map((offer) => {
        if (offer.id === id) {
          return { ...offer, type, status };
        }
        return offer;
      })
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
  if (!context) {
    throw new Error("useOffers must be used within an OffersProvider");
  }
  return context;
}

export function getStatusColor(type: OfferType): string {
  if (type === "received") {
    return "bg-blue-500/10 text-blue-500";
  } else if (type === "accepted") {
    return "bg-emerald-500/10 text-emerald-500";
  } else if (type === "withdrawn") {
    return "bg-red-500/10 text-red-500";
  } else {
    return "bg-gray-500/10 text-gray-500";
  }
}
