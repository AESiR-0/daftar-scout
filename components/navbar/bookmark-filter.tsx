"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useBookmarks } from "@/lib/context/bookmark-context"

export function BookmarkFilter() {
    const { showBookmarked, toggleFilter } = useBookmarks()

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