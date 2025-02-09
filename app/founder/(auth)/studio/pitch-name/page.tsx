"use client"

import { usePathname } from "next/navigation"
import { StudioCard } from "../components/layout/studio-card"
import PitchNameForm from "./form"

export default function PitchNamePage() {
    const pathname = usePathname()
    const pitchId = pathname.split('/')[-1]

    return (
        <StudioCard 
        >
            <PitchNameForm mode="Create" pitch={pitchId} />
        </StudioCard>
    )
}