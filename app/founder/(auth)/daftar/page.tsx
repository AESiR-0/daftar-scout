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
    const [teamDialogOpen, setTeamDialogOpen] = useState(false)
    const [selectedDaftar, setSelectedDaftar] = useState<typeof daftarsData[0] | null>(null)
    const [createDaftarOpen, setCreateDaftarOpen] = useState(false)
    return (
        <div className={` px-20 overflow-hidden container mx-auto ${teamDialogOpen ? "opacity-0 pointer-events-none" : ""}`}>

            <div className="flex gap-6">

                {/* Daftars and Pitches Section */}
                <div className="space-y-6 w-full">
                    {/* Header with Search and Actions */}
                    <div className="flex px-4 mx-auto items-center justify-end gap-5">
                        <Button size="sm" className="h-9 bg-muted hover:bg-muted/50  text-white"
                            onClick={() => setCreateDaftarOpen(true)}>
                            New Daftar
                        </Button>
                        <Link href="/founder/pitch-board">
                            <Button size="sm" variant="outline" className="h-9">
                                Deal Board
                            </Button>
                        </Link>
                    </div>
                    {/* {filteredDaftars.map((daftar) =>  */}
                    <ScrollArea className="h-[calc(100vh-10rem)]">
                        <div className=" mx-auto px-4 space-y-5">
                            {daftarsData.map((daftar) => (
                                <div
                                    key={daftar.name}
                                    className="border bg-[#1a1a1a]  hover:bg-[#252525]  rounded-[0.35rem]  divide-y cursor-pointer hover:border-muted-foreground"
                                    onClick={(e: any) => {
                                        if (!teamDialogOpen) {
                                            e.preventDefault()
                                            setSelectedDaftar(daftar)
                                        }

                                    }}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{daftar.name}</h3>
                                            <Button onClick={() => {
                                                setSelectedDaftar(daftar)
                                                setTeamDialogOpen(true)
                                            }} variant="secondary" size="sm" className="text-xs">
                                                <Users className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {teamDialogOpen && (
                                        <TeamDialog daftarData={selectedDaftar} open={teamDialogOpen} onOpenChange={setTeamDialogOpen} />
                                    )}
                                    <div className="divide-y">
                                        {daftar.pitches.map((pitch) => (
                                            <div
                                                key={pitch.name}
                                                className="p-4 hover:bg-muted/50"
                                            >
                                                <Link href={`/founder/studio`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">{pitch.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Status: {pitch.status}
                                                            </p>
                                                        </div>
                                                        <span className={"text-xs"}>
                                                            <ChevronRight className="h-4 w-4" />
                                                        </span>
                                                    </div>
                                                </Link>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <CreateDaftarDialog
                open={createDaftarOpen}
                onOpenChange={setCreateDaftarOpen}
                onSuccess={() => {
                    setCreateDaftarOpen(false)
                }}
            />
        </div >
    )
} 