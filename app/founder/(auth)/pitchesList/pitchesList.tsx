"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getFounderPitches } from "@/lib/apiActions";
import formatDate from "@/lib/formatDate";

// Reusing your custom Pitch type
type Pitch = {
  id: string;
  pitchName: string;
  location: string;
  scoutId: string | null;
  demoLink: string;
  stage: string;
  askForInvestor: boolean;
  createdAt: string;
  status: string | null;
  isCompleted: boolean;
  teamSize: number | null;
  isPaid: boolean;
};

type PitchesListProps = {
  pitchBoard?: Pitch[];
};

export default function PitchesList({ pitchBoard }: PitchesListProps) {
  const [pitches, setPitches] = useState<Pitch[]>(pitchBoard || []);
  const [loading, setLoading] = useState(!pitchBoard);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pitchBoard) return; // Don't fetch if pitchBoard is already provided

    async function fetchPitches() {
      try {
        const data = await getFounderPitches(5);
        setPitches(data);
      } catch (err) {
        console.error("Error fetching pitches:", err);
        setError("Failed to load pitches data.");
      } finally {
        setLoading(false);
      }
    }

    fetchPitches();
  }, [pitchBoard]);

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
              <Link href={`/founder/${pitch.scoutId}/${pitch.id}/studio/`}>
                <div className="flex items-center justify-between px-4 py-2 rounded-[0.35rem] transition-all duration-200 hover:bg-muted/40">
                  <div className="flex-1">
                    <h3 className="text-medium">{pitch.pitchName}</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Created At:{" "}
                        {/* {new Date(pitch.createdAt).toLocaleDateString()} */}
                        {formatDate(pitch.createdAt)}
                      </div>
                      <div>Location: {pitch.location}</div>
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
