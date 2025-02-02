"use client"

import { scoutDetailsData } from "@/lib/dummy-data/scout-details"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"
import { useBookmarks } from "@/lib/context/bookmark-context"
import { daftarsData } from "@/lib/dummy-data/daftars"

export default function IncubationPage() {
    const { showBookmarked, bookmarkedSlugs, toggleBookmark } = useBookmarks()

    const filteredScouts = showBookmarked
        ? scoutDetailsData.filter(scout => bookmarkedSlugs.has(scout.slug))
        : scoutDetailsData

    return (
        <div className="container mx-auto px-10 py-6">
            <div className="space-y-3">
                {filteredScouts.map((scout) => (
                    <Link
                        key={scout.slug}
                        href={`/founder/incuhub/${scout.slug}`}
                        className="block"
                    >   <div className="">
                            <div className="flex justify-end py-2">
                                <div className="text-sm text-muted-foreground">
                                    Pitched: {daftarsData.find(d => d.id === scout.daftarId)?.pitchCount || 0}
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] py-6 p-4 hover:bg-[#252525] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">{scout.title}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            In collaboration with {scout.collaboration}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <BookmarkButton
                                            isBookmarked={bookmarkedSlugs.has(scout.slug)}
                                            onToggle={() => toggleBookmark(scout.slug)}
                                        />
                                        <div className="text-sm text-muted-foreground flex flex-col">
                                            <span>                                            Last date for pitch: </span> <span>{scout.lastPitchDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    )
}