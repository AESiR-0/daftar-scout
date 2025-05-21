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
        const currentUrl = window.location.href;
        const postText = `${title}\n\n${description}\n\n${currentUrl}`;
        const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
        window.open(linkedInUrl, '_blank');
    }

    return (
        <Button variant="outline" className="p-4 py-4 rounded-[0.35rem]" onClick={handleShare}>
            Share
        </Button>
    )
} 