"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScoutPage() {
  const [isPlanning, setIsPlanning] = useState<boolean | null>(null);
  const [isScheduling, setIsScheduling] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoutStatus = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Replace with actual API call, e.g.:
        // const res = await fetch("/api/endpoints/scout");
        // const { isPlanning, isScheduling } = await res.json();
        setIsPlanning(true); // Hardcoded for now
        setIsScheduling(false); // Hardcoded for now
      } catch (error) {
        console.error("Failed to fetch scout status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScoutStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex h-full items-center justify-center bg-[#0e0e0e] p-4">
        <Skeleton className="h-6 w-64 bg-[#2a2a2a] rounded-[0.35rem]" />
      </div>
    );
  }

  if (isPlanning) {
    return (
      <div className="flex-1 flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Click on the Studio to scout Startups
          </p>
        </div>
      </div>
    );
  } else if (isScheduling) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Your scout is scheduled.</p>
      </div>
    );
  }
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <p className="text-muted-foreground">Select a pitch to view details</p>
    </div>
  );
}