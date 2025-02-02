"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearch } from "@/lib/context/search-context"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { daftarsData } from "@/lib/dummy-data/daftars"

// Transform daftars data into pitch board format
const pitches = daftarsData.flatMap(daftar => daftar.pitches)

// Group pitches by status
const groupedPitches = pitches.reduce((acc, pitch) => {
    const status = pitch.status
    if (!acc[status]) {
        acc[status] = []
    }
    acc[status].push(pitch)
    return acc
}, {} as Record<string, typeof pitches>)

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

    // Filter pitches based on search query and filter value
    const filteredPitches = Object.entries(groupedPitches).reduce((acc, [status, statusPitches]) => {
        const filtered = statusPitches.filter(pitch => {
            const matchesSearch =
                pitch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pitch.postedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pitch.scoutName.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesFilter = filterValue === 'all' ||
                (filterValue === 'planning' && status === 'Planning') ||
                (filterValue === 'pitched' && status === 'Pitched') ||
                (filterValue === 'offer' && status === 'Offer Received') ||
                (filterValue === 'accepted' && status === 'Accepted') ||
                (filterValue === 'cancelled' && status === 'Deal Cancelled')

            return matchesSearch && matchesFilter
        })
        return filtered.length > 0 ? { ...acc, [status]: filtered } : acc
    }, {} as Record<string, typeof pitches>)

    return (
        <div className="space-y-6 container w-full flex-col items-center justify-center mx-auto px-4">
            <div className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Pitch Board</h2>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setCreateDaftarOpen(true)}
                    >
                        New Daftar
                    </Button>
                    <Link href="/daftar">
                        <Button size="sm" variant="outline" className="h-9">
                            My Daftar
                        </Button>
                    </Link>
                </div>
            </div>

            <ScrollArea className="w-[calc(100vw-14rem)] whitespace-nowrap rounded-lg">
                <div className="flex gap-6 p-1">
                    {Object.entries(filteredPitches).map(([status, pitches]) => (
                        <div
                            key={status}
                            className="flex-none w-[300px] bg-muted/30 rounded-lg p-4 min-h-[calc(100vh-12rem)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium capitalize">
                                        {status.replace(/([A-Z])/g, ' $1').trim()}
                                    </h3>
                                    <div className="text-xs text-muted-foreground bg-muted rounded-[0.3rem] px-2 py-1">
                                        {pitches.length}
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="h-[calc(100vh-16rem)]">
                                <div className="space-y-3 pr-4">
                                    {pitches.map((pitch) => (
                                        <Link
                                            key={pitch.id}
                                            href={`/pitch-board/${pitch.id}`}
                                        >
                                            <div className="p-4 rounded-[0.3rem] mb-2 bg-background border 
                                                hover:bg-muted hover:border-muted 
                                                transition-all duration-200 ease-in-out
                                                cursor-pointer"
                                            >
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="font-medium text-sm">{pitch.name}</h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Scout: {pitch.scoutName}
                                                        </p>
                                                    </div>
                                                    <div className="pt-2">
                                                        <p className="text-xs mt-1">
                                                            Posted by {pitch.postedBy}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            From {pitch.daftar}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <CreateDaftarDialog
                open={createDaftarOpen}
                onOpenChange={setCreateDaftarOpen}
            />
        </div>
    )
} 