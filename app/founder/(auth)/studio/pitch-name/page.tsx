"use client"

import { usePathname } from "next/navigation"
import { StudioCard } from "../components/layout/studio-card"
import PitchNameForm from "./form"

export default function PitchNamePage() {
    const pathname = usePathname()
    const pitchId = pathname.split('/')[-1]

    return (
        <StudioCard
            title="Create Your Pitch"
            description="Please fill in the following details to create your pitch."
        >
            <PitchNameForm mode="Create" pitch={pitchId} />
        </StudioCard>
    )
}