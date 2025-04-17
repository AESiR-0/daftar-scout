"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
    title: string
    description: string
}

export function ShareButton({ title, description }: ShareButtonProps) {
    const { toast } = useToast()
    const handleShare = async () => {
        const shareData = {
            title,
            text: description,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast({
                    title: "Link copied to clipboard",
                    description: "You can now share it with others"
                })
            }
        } catch (error) {
            console.error("Error sharing:", error)
        }
    }

    return (
        <Button variant="outline" className="p-4 py-4 rounded-[0.35rem]" onClick={handleShare}>
            Share
        </Button>
    )
} 