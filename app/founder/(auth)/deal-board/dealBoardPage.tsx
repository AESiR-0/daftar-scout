"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearch } from "@/lib/context/search-context"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getFounderPitches } from "@/lib/apiActions"
import type { Pitch } from "@/lib/dummy-data/daftars"

// Define the status order based on user role
const founderStatusOrder = ["Inbox", "Accepted", "Declined", "Withdrawn", "Deleted"]
const investorStatusOrder = ["Planning", "Scheduled", "Open", "Closed"]

// Use founder status order by default (you can make this dynamic based on user role)
const statusOrder = founderStatusOrder

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export default function PitchBoardPage() {
    const { searchQuery, filterValue } = useSearch()
    const [createDaftarOpen, setCreateDaftarOpen] = useState(false)
    const [groupedPitches, setGroupedPitches] = useState<Record<string, Pitch[]>>({})

    useEffect(() => {
        async function fetchPitches() {
            try {
                const pitches: Pitch[] = await getFounderPitches(5)
                // Group pitches by status with ordered categories
                const grouped = statusOrder.reduce((acc, status) => {
                    acc[status] = pitches.filter(pitch => pitch.status === status)
                    return acc
                }, {} as Record<string, Pitch[]>)
                setGroupedPitches(grouped)
            } catch (error) {
                console.error("Error fetching pitches:", error)
            }
        }
        fetchPitches()
    }, [])

    // Update filter logic for new status categories
    const filteredPitches = Object.entries(groupedPitches).reduce((acc, [status, statusPitches]) => {
        const filtered = statusPitches.filter(pitch => {
            const matchesSearch =
                pitch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pitch.scoutName.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesFilter = filterValue === 'all' ||
                (filterValue === 'planning' && status === 'Planning') ||
                (filterValue === 'inbox' && status === 'Inbox') ||
                (filterValue === 'accepted' && status === 'Accepted') ||
                (filterValue === 'declined' && status === 'Declined') ||
                (filterValue === 'withdrawn' && status === 'Withdrawn') ||
                (filterValue === 'deleted' && status === 'Deleted')

            return matchesSearch && matchesFilter
        })
        return filtered.length > 0 ? { ...acc, [status]: filtered } : acc
    }, {} as Record<string, Pitch[]>)

    // Check if there are any pitches
    const hasPitches = Object.values(groupedPitches).some(pitches => pitches.length > 0)

    return (
        <div className="space-y-6 mx-auto flex-col items-center justify-center px-4">
            {hasPitches ? (
                <ScrollArea className="w-[calc(100vw-12rem)] flex justify-center items-center rounded-[0.35rem]">
                    <div className="flex gap-6 p-1">
                        {statusOrder.map(status => {
                            const statusPitches = filteredPitches[status] || []
                            return (
                                <div
                                    key={status}
                                    className="flex-none w-[300px] bg-muted/30 rounded-[0.35rem] p-4 min-h-[calc(100vh-12rem)]"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{status}</h3>
                                            <div className="text-xs text-muted-foreground bg-muted rounded-[0.35rem] px-2 py-1">
                                                {statusPitches.length}
                                            </div>
                                        </div>
                                    </div>

                                    <ScrollArea className="h-[calc(100vh-16rem)]">
                                        <div className="space-y-3">
                                            {statusPitches.map((pitch) => (
                                                <Link
                                                    key={pitch.id}
                                                    href={`/founder/studio`}
                                                >
                                                    <div className="p-4 rounded-[0.35rem] mb-2 bg-background border 
                                                        hover:bg-muted hover:border-muted 
                                                        transition-all duration-200 ease-in-out
                                                        cursor-pointer"
                                                    >
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h4 className="font-medium text-sm">{pitch.name}</h4>
                                                                <div className="flex flex-col gap-1 mt-1">
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        Collaboration: Nithin Kamath, Piyush Bansal, Aman Gupta
                                                                    </p>
                                                                    <p className="text-xs font-medium">Pitch: {pitch.pitchName}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <div className="flex items-center justify-center h-[40vh]">
                    <p className="text-lg text-muted-foreground">No pitches yet</p>
                </div>
            )}
            <CreateDaftarDialog
                onSuccess={() => {
                    setCreateDaftarOpen(false)
                }}
                open={createDaftarOpen}
                onOpenChange={setCreateDaftarOpen}
            />
        </div>
    )
} 