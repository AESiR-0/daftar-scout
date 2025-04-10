"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PitchesList from "@/app/founder/(auth)/pitchesList/pitchesList";
import ScoutPage from "@/app/founder/(auth)/scout/scoutPage";
import DealBoardPage from "../deal-board/dealBoardPage";
import MeetingsPage from "../meetings/page";

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

type Scout = {
  id: string;
  title: string;
  postedby: string;
  status: string;
  scheduledDate: string;
  collaborator: string[];
};

export default function PitchPage() {
  const [selectedTab, setSelectedTab] = useState("dealBoard");
  const [counts, setCounts] = useState({
    meetings: 0,
    scouts: 0,
    pitches: 0,
  });
  const [pitchesArray, setPitches] = useState<Pitch[]>([]);
  const [scoutsArray, setScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(false);

  const navItems = [
    { id: "meetings", label: "Meetings", count: counts.meetings },
    { id: "scout", label: "Scout", count: counts.scouts },
    { id: "pitches", label: "Pitches", count: counts.pitches },
    { id: "dealBoard", label: "Deal Board", count: counts.pitches },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [pitchRes, scoutRes] = await Promise.all([
          fetch("/api/endpoints/pitch"),
          fetch("/api/endpoints/scouts"),
        ]);

        if (!pitchRes.ok || !scoutRes.ok) throw new Error("Fetch failed");

        const pitchData = await pitchRes.json();
        const scoutData = await scoutRes.json();

        setPitches(pitchData);
        setScouts(scoutData);
        setCounts((prev) => ({
          ...prev,
          pitches: pitchData.length ?? 0,
          scouts: scoutData.length ?? 0,
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6 container mx-auto px-10">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-end gap-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                "flex items-center rounded-[0.35rem] gap-1",
                selectedTab === item.id && "bg-accent"
              )}
              onClick={() => setSelectedTab(item.id)}
            >
              {item.label}
              <Badge variant="secondary" className="ml-1">
                {item.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            {selectedTab === "pitches" && (
              <PitchesList pitchBoard={pitchesArray} />
            )}
            {selectedTab === "meetings" && <MeetingsPage />}
            {selectedTab === "scout" && <ScoutPage scouts={scoutsArray} />}
            {selectedTab === "dealBoard" && (
              <DealBoardPage pitches={pitchesArray} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
