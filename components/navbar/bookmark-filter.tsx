"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { usePathname } from "next/navigation"
import { useBookmarks } from "@/lib/context/bookmark-context"

export function BookmarkFilter() {
    const pathname = usePathname()
    const { showBookmarked, toggleFilter } = useBookmarks()

    // Only show in incuhub page
    if (pathname !== "/founder/pitch") return null

    return (
        <Button
            onClick={toggleFilter}
            className="gap-2"
            size="sm"
        >
            <Bookmark className={`h-4 ${showBookmarked ? 'fill-current' : ''}   w-4`} />
        </Button>
    )
} 