"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"
import { cn } from "@/lib/utils"
import { useSearch } from "@/lib/context/search-context"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { TeamDialog } from "@/components/dialogs/team-dialog"
import { ChevronRight, Filter, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

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

// Dummy data for pitches
const pitchesData = [
  {
    id: "1",
    title: "AI-Powered Healthcare Solution",
    lastDate: "2024-04-15",
    slug: "ai-healthcare"
  },
  {
    id: "2",
    title: "Sustainable Energy Platform",
    lastDate: "2024-04-20",
    slug: "sustainable-energy"
  },
  {
    id: "3",
    title: "EdTech Learning System",
    lastDate: "2024-04-25",
    slug: "edtech-learning"
  }
]

const overview = {
    totalDaftars: 5,
    activePitches: 8,
    acceptedPitches: 3,
    rejectedPitches: 2,
    recentActivity: [
        {
            action: "Pitch Accepted",
            daftar: "Tech Innovation Fund",
            date: "2024-03-15"
        },
        {
            action: "New Pitch Submitted",
            daftar: "Sustainable Growth",
            date: "2024-03-14"
        },
        {
            action: "Daftar Created",
            daftar: "Healthcare Ventures",
            date: "2024-03-12"
        }
    ]
}

// Add date formatter
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export default function DaftarPage() {
    return (
        <div className="container mx-auto px-5">
            <div className="bg-[#1a1a1a] rounded-[0.35rem] p-6">
                <div className="space-y-4">
                    {daftarsData.map((daftar) => (
                        daftar.pitches.map((pitch) => (
                            <div 
                                key={pitch.name}
                                className="border-b border-border last:border-0 pb-4 last:pb-0 hover:bg-[#252525] rounded-[0.35rem] transition-colors cursor-pointer"
                            >
                                <Link href="/founder/studio">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-medium">{pitch.name}</h3>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div>Status: {pitch.status}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </Link>
                            </div>
                        ))
                    ))}
                </div>
            </div>
        </div>
    )
} 