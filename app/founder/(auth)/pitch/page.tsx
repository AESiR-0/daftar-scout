"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import  DaftarPage from "@/app/founder/(auth)/daftar/daftarPage"
import ScoutPage from "@/app/founder/(auth)/scout/scoutPage"
import DealBoardPage from "../deal-board/dealBoardPage"
export default function PitchPage() {
  const [selectedTab, setSelectedTab] = useState("pitches")
  
  const counts = {
    meetings: 5,
    scout: 3,
    pitches: 8,
    dealBoard: 2
  }

  const navItems = [
    { id: "meetings", label: "Meetings", count: counts.meetings },
    { id: "scout", label: "Scout", count: counts.scout },
    { id: "pitches", label: "Pitches", count: counts.pitches },
    { id: "dealBoard", label: "Deal Board", count: counts.dealBoard },
  ]

  return (
    <div className="space-y-6 container mx-auto px-10">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-end gap-4">
          {navItems.map((item) => (
            <Button 
              key={item.id}
              variant="outline"
              className={cn(
                "flex items-center gap-1",
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
        {selectedTab === "pitches" && <DaftarPage />}
        {selectedTab === "meetings" && <div>Meetings Content</div>}
        {selectedTab === "scout" && <ScoutPage />}
        {selectedTab === "dealBoard" && <DealBoardPage />}
      </div>
    </div>
  )
} 