"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookmarkButtonProps {
    isBookmarked: boolean
    onToggle?: () => void
}

export function BookmarkButton({ isBookmarked, onToggle }: BookmarkButtonProps) {
    const { toast } = useToast()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation
        onToggle?.()
        toast({
            title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
            description: isBookmarked ? "Program removed from your bookmarks" : "Program added to your bookmarks"
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
            onClick={handleClick}
        >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
    )
} 