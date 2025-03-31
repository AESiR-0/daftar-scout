"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/context/search-context";
import { daftarsData } from "@/lib/dummy-data/daftars";
import type { Pitch } from "@/lib/dummy-data/daftars";
import { TeamDialog } from "@/components/dialogs/team-dialog";
import { ChevronRight, Filter, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { getFounderPitches } from "@/lib/apiActions";

// Add these interfaces at the top
interface TeamMember {
  name: string;
  role: string;
  email: string;
}

interface DaftarSubscription {
  plan: string;
  status: string;
  nextBilling: string;
  features: string[];
}

// Define the Pitch interface

const overview = {
  totalDaftars: 5,
  activePitches: 8,
  acceptedPitches: 3,
  rejectedPitches: 2,
  recentActivity: [
    {
      action: "Pitch Accepted",
      daftar: "Tech Innovation Fund",
      date: "2024-03-15",
    },
    {
      action: "New Pitch Submitted",
      daftar: "Sustainable Growth",
      date: "2024-03-14",
    },
    {
      action: "Daftar Created",
      daftar: "Healthcare Ventures",
      date: "2024-03-12",
    },
  ],
};

// Add date formatter
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PitchesList() {
  const [pitches, setPitches] = useState<Pitch[]>(daftarsData[0].pitches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //     async function fetchPitches() {
  //         try {
  //             const data: Pitch[] = await getFounderPitches(5)
  //             setPitches(data)
  //         } catch (err) {
  //             console.error("Error fetching pitches:", err)
  //             setError("Failed to load pitches data.")
  //         } finally {
  //             setLoading(false)
  //         }
  //     }
  //     fetchPitches()
  // }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-lg text-muted-foreground">Loading pitches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-lg text-muted-foreground">No pitches available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5">
      <div className="bg-[#1a1a1a] rounded-[0.35rem] p-6">
        <div className="space-y-4">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="group border-b border-border last:border-0 last:pb-0"
            >
              <Link href={`/founder/studio/`}>
                <div className="flex items-center justify-between px-4 py-2 rounded-[0.35rem] transition-all duration-200 hover:bg-muted/40">
                  <div className="flex-1">
                    <h3 className="text-medium">{pitch.name}</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Last Date: {pitch.date}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
