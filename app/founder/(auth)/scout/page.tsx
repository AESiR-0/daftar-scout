"use client"

import { scoutDetailsData } from "@/lib/dummy-data/scout-details"
import { useRouter } from "next/navigation"
import { BookmarkButton } from "@/components/bookmark-button"
import { useBookmarks } from "@/lib/context/bookmark-context"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { InvestorProfile } from "@/components/InvestorProfile"

export default function IncubationPage() {
    const router = useRouter()
    const { showBookmarked, bookmarkedSlugs, toggleBookmark } = useBookmarks()

    const filteredScouts = showBookmarked
        ? scoutDetailsData.filter(scout => bookmarkedSlugs.has(scout.slug))
        : scoutDetailsData

    return (
        <div className="container mx-auto px-20 py-6">
            <div className="space-y-10">
                {filteredScouts.map((scout) => (
                    <div onClick={() => router.push(`/founder/incuhub/${scout.slug}`)} key={scout.slug}>

                        <div className="bg-[#1a1a1a]  hover:bg-[#252525] py-3 p-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 ">
                                    <h2 className="text-xl ">{scout.title}</h2>
                                    <div className="text-xs mt-2 space-y-1 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            Collaboration: {scout.collaborators.map((collaborator, index) => (
                                                <span key={collaborator.daftarName} onClick={(e) => e.preventDefault()}>
                                                    {index > 0 && ", "}
                                                    <InvestorProfile
                                                        investor={collaborator}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                        <div>Last Date to Pitch: {scout.lastPitchDate}</div>
                                        <div>Pitched: {daftarsData.find(d => d.id === scout.daftarId)?.pitchCount || 0} Startups</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <BookmarkButton
                                        isBookmarked={bookmarkedSlugs.has(scout.slug)}
                                        onToggle={() => toggleBookmark(scout.slug)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    )
}