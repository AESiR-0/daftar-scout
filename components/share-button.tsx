"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
    daftarName: string;
    sector: string;
    stage: string;
    lastDate: string;

    applyUrl: string;
}

export function ShareButton({ daftarName, sector, stage, lastDate, applyUrl }: ShareButtonProps) {
    const { toast } = useToast()
    const handleShare = async () => {
        const postText = `${daftarName} Scouting Startups #DaftarOS

If you have a startup idea, pitch to us in a 2.5 minute video, in the 
language you're most comfortable speaking. Your first meeting with us 
is just a few minutes away, and we can't wait to hear from you.

Accepting pitches from: ${location}
Stage: ${stage}
Sector: ${sector}
Last Day to Pitch: ${lastDate}
Pitch Now: ${applyUrl}

Daftar OS
Simplifying Startup Pitching and Scouting
    `;
        const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
        window.open(linkedInUrl, '_blank');
    }

    return (
        <Button variant="outline" className="p-4 py-4 rounded-[0.35rem]" onClick={handleShare}>
            Share
        </Button>
    )
} 