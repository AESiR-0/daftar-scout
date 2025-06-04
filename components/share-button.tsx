"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
    daftarName: string;
    sector: string;
    stage: string;
    lastDate: string;
    title: string;
    description: string;
    applyUrl: string;
}

export function ShareButton({ daftarName, sector, title, description, stage, lastDate, applyUrl }: ShareButtonProps) {
    const { toast } = useToast()
    const handleShare = async () => {
        const postText = `${daftarName} is looking to invest in startups in ${sector} at ${stage} that are creating high impact.\n\nPitch your startup in a 2.5-minute video in your language, and let's explore how we can take this ahead.\n\nLast day to pitch: ${lastDate}\n\napply: ${applyUrl}`;
        const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
        window.open(linkedInUrl, '_blank');
    }

    return (
        <Button variant="outline" className="p-4 py-4 rounded-[0.35rem]" onClick={handleShare}>
            Share
        </Button>
    )
} 