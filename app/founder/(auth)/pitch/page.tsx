"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import PitchesList from "@/app/founder/(auth)/pitchesList/pitchesList"
import ScoutPage from "@/app/founder/(auth)/scout/scoutPage"
import DealBoardPage from "../deal-board/dealBoardPage"
import MeetingsPage from "../meetings/page"
import { getAllPitches } from '@/lib/apiActions'

interface counts {
  meetings: number,
  scouts: number,
  pitches: number
}
export default function PitchPage() {
  const [selectedTab, setSelectedTab] = useState("dealBoard")
  const [counts, setCounts] = useState({
    meetings: 0,
    scouts: 0,
    pitches: 0
  })
  const navItems = [
    { id: "meetings", label: "Meetings", count: counts.meetings },
    { id: "scout", label: "Scout", count: counts.scouts },
    { id: "pitches", label: "Pitches", count: counts.pitches },
    { id: "dealBoard", label: "Deal Board", count: counts.pitches },
  ]

  useEffect(() => {
    async function fetchCount() {
      const res = await getAllPitches();
      console.log(res);
    }
    fetchCount()
  }, [])

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

      {/* Content Section */}
      <div className="mt-6">
        {selectedTab === "pitches" && <PitchesList />}
        {selectedTab === "meetings" && <MeetingsPage />}
        {selectedTab === "scout" && <ScoutPage />}
        {selectedTab === "dealBoard" && <DealBoardPage />}
      </div>
    </div>
  )
} 